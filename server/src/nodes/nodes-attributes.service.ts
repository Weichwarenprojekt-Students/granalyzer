import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import Node from "./node.model";
import { DataSchemeUtil } from "../util/data-scheme.util";
import { DatabaseUtil } from "../util/database.util";
import { DataSchemeService } from "../data-scheme/data-scheme.service";

@Injectable()
export class NodesAttributesService {
    /**
     * Customer database
     */
    private database = process.env.DB_CUSTOMER;

    constructor(
        private readonly neo4jService: Neo4jService,
        private readonly dataSchemeUtil: DataSchemeUtil,
        private readonly dataSchemeService: DataSchemeService,
        private readonly databaseUtil: DatabaseUtil,
    ) {}

    /**
     * Modifies the attributes of the specified node
     * @param nodeId The UUID of the node
     * @param node The node to be modified
     */
    async setAttributes(nodeId: string, node: Node): Promise<Node> {
        if (nodeId != node.nodeId) throw new InternalServerErrorException("Node-UUID mismatch");

        // Get the data scheme for the label of this node
        const scheme = await this.dataSchemeService.getLabelScheme(node.label);

        // TODO: Remove type checks?
        // Throws an exception if the attribute values do not match their datatype
        this.dataSchemeUtil.checkAttributesIntegrity(scheme, node);

        // language=Cypher
        const query = `
          MATCH(node)
            WHERE node.nodeId = $nodeId
          WITH LABELS(node) AS lbls, node
          UNWIND lbls AS label
          SET node += $attributes
          RETURN node{. *, label:label} AS node`;

        const params = {
            nodeId,
            attributes: {},
        };

        // Decide which data needs to be written to database
        scheme.attributes.forEach((attribute) => {
            const attr = node.attributes[attribute.name];

            if ((!attribute.mandatory && attr) || (attribute.mandatory && attr && attr != attribute.defaultValue)) {
                // Write the new (non-)mandatory value into the DB
                params.attributes[attribute.name] = attr;
            } else if (!attribute.mandatory && !attr) {
                // Delete the unset non-mandatory attribute from DB
                params.attributes[attribute.name] = null;
            }
        });

        const resolveRead = async (res) => await this.dataSchemeUtil.parseNode(res.records[0]);

        return this.neo4jService
            .write(query, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }
}
