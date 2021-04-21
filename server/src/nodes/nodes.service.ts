import { Injectable } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import Node from "./node.model";
import { DataSchemeUtil } from "../util/data-scheme.util";
import { DatabaseUtil } from "../util/database.util";

@Injectable()
export class NodesService {
    /**
     * Customer database
     */
    private database = process.env.DB_CUSTOMER;

    constructor(
        private readonly neo4jService: Neo4jService,
        private readonly dataSchemeUtil: DataSchemeUtil,
        private readonly databaseUtil: DatabaseUtil,
    ) {}

    /**
     * Creates a new node with a new unique UUID
     * @param node The node to be created
     */
    async createNode(node: Node): Promise<Node> {
        // Throws an exception if there is no such label
        await this.dataSchemeUtil.getLabelScheme(node.label);

        // language=Cypher
        const query = `CREATE(node:${node.label})
                       SET node.nodeId=apoc.create.uuid(), node.name=$name, node+=$attributes
                       WITH LABELS(node) AS lbls, node
                       UNWIND lbls AS label
                       RETURN node {. *, label:label} AS node `;
        const params = {
            name: node.name,
            attributes: {},
        };

        for (const [key, value] of Object.entries(node.attributes)) {
            if (
                (key != "nodeId" && key != "name") ||
                (key === "name" && typeof value === "string" && value.replace(" ", "").length > 0)
            ) {
                params.attributes[key] = value;
            }
        }

        const resolveRead = async (res) => await this.dataSchemeUtil.parseNode(res.records[0]);
        return this.neo4jService
            .write(query, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Deletes the specified node and all its relations
     * @param nodeId The node to be deleted
     */
    async deleteNode(nodeId: string): Promise<Node> {
        // language=Cypher
        const query = `MATCH(node)
                         WHERE node.nodeId=$nodeId
                       WITH LABELS(node) AS lbls, PROPERTIES(node) AS copyNode, node
                       UNWIND lbls AS label
                       DETACH DELETE node
                       RETURN copyNode{. *, label:label} AS node`;
        const params = {
            nodeId,
        };

        const resolveRead = async (res) => await this.dataSchemeUtil.parseNode(res.records[0]);
        return this.neo4jService
            .write(query, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Modifies the attributes of the specified node
     * @param nodeId The UUID of the node
     * @param node The node to be modified
     */
    async modifyNode(nodeId: string, node: Node): Promise<Node> {
        const oldName = (await this.getNode(nodeId)).name;
        const passedName = node.attributes["name"];
        if (!passedName) {
            node.attributes["name"] = oldName;
        } else if (passedName && (typeof passedName != "string" || passedName.replace(" ", "").length < 1)) {
            delete node.attributes["name"];
            node.attributes["name"] = oldName;
        } else {
            node.attributes["name"] = oldName;
        }

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

        for (const [key, value] of Object.entries(node.attributes)) {
            params.attributes[key] = value;
        }
        // Restore/force override the missing node id
        params.attributes["nodeId"] = nodeId;

        const resolveRead = async (res) => await this.dataSchemeUtil.parseNode(res.records[0]);
        return this.neo4jService
            .write(query, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Returns a specific node by id
     */
    async getNode(id: string): Promise<Node> {
        // language=Cypher
        const query = `
          MATCH (n)
            WHERE n.nodeId = $id
          WITH LABELS(n) AS lbls, n
          UNWIND lbls AS label
          RETURN n {. *, label:label} AS node`;
        const params = {
            id,
        };

        // Callback which parses the received data
        const resolveRead = async (res) => await this.dataSchemeUtil.parseNode(res.records[0]);

        return this.neo4jService
            .read(query, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Return all nodes with limit and offset (pagination) from the neo4j db
     * @param limit
     * @param offset
     * @param nameFilter
     * @param labelFilter
     */
    async getAllNodes(
        limit: number,
        offset: number,
        nameFilter?: string,
        labelFilter?: Array<string>,
    ): Promise<Node[]> {
        // Convert single filters to array to keep handling consistent
        labelFilter = Array.isArray(labelFilter) ? labelFilter : [labelFilter];

        // Create the filter part of the cypher query
        const filter = await this.generateFilterString(nameFilter, labelFilter);

        // language=Cypher
        const query = `
          MATCH (n) ${filter}

          WITH LABELS(n) AS lbls, n
          UNWIND lbls AS label
          RETURN n {. *, label:label} AS node
            ORDER BY n.name
            SKIP $offset
            LIMIT $limit`;
        const params = {
            limit: this.neo4jService.int(limit),
            offset: this.neo4jService.int(offset),
            nameFilter: nameFilter,
        };

        // Callback which is applied on the database response
        const resolveRead = (result) => Promise.all(result.records.map((el) => this.dataSchemeUtil.parseNode(el)));

        return this.neo4jService
            .read(query, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Generate a string to filter nodes by
     *
     * @param nameFilter Name to filter by
     * @param labelFilter Labels to filter by
     * @private
     */
    private async generateFilterString(nameFilter?: string, labelFilter?: string[]): Promise<string> {
        // Validates the given labels to prevent injections
        labelFilter = await this.validateLabelFilter(labelFilter);

        let filter = "";

        if (nameFilter) filter = "WHERE toLower(n.name) CONTAINS toLower($nameFilter) ";

        if (labelFilter.length !== 0) {
            filter += nameFilter ? "AND " : "WHERE ";
            filter += "(";
            labelFilter.forEach((label, index) => {
                filter += index == labelFilter.length - 1 ? `n:${label}) ` : `n:${label} OR `;
            });
        }
        return filter;
    }

    /**
     * Validates all given labels
     * @private
     */
    private async validateLabelFilter(labelFilter: string[] = []): Promise<string[]> {
        // Get all valid labels from the database
        // language=Cypher
        const cypher = `
          MATCH (l:LabelScheme)
          RETURN l {.name}`;
        const validLabels = await this.neo4jService
            .read(cypher, {}, process.env.DB_TOOL)
            .then((res) => res.records.map((r) => r.get("l").name))
            .catch(this.databaseUtil.catchDbError);

        // Filter not valid labels
        return validLabels.filter((lbl) => labelFilter.includes(lbl));
    }
}
