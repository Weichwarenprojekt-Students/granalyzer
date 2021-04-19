import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import Node from "./node.model";
import { DataSchemeUtil } from "../util/data-scheme.util";
import { DatabaseUtil } from "../util/database.util";
import { NodesService } from "./nodes.service";
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
        private readonly databaseUtil: DatabaseUtil,
        private readonly nodesService: NodesService,
        private readonly dataSchemeService: DataSchemeService,
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

        // language=Cypher
        const query = `
          MATCH(node)
            WHERE node.nodeId = $nodeId
          WITH LABELS(node) AS lbls, node
          UNWIND lbls AS label
          SET node = $attributes
          RETURN node{. *, label:label} AS node`;

        const params = {
            nodeId,
            attributes: {},
        };

        // Convert attributes to correct datatype and replace missing mandatory attributes with default value
        node = await this.dataSchemeUtil.parseNode(node);

        scheme.attributes.forEach((attribute) => {
            // Delete non-mandatory attribute from DB if not set
            // Do not delete mandatory attribute if not set
            // If mandatory and value equal default value --> Do nothing
            // TODO: Implement value checks, use data-scheme-util methods?
        });

        // TODO: Check if attribute should be deleted

        // Callback which parses the received data
        const resolveRead = async (res) => await this.dataSchemeUtil.parseNode(res.records[0]);

        return this.neo4jService
            .read(query, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }
}
