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
        // language=Cypher
        const query = `
          CALL apoc.create.node([$label], {}) YIELD node

          SET node.nodeId = apoc.create.uuid(), node+=$attributes
          WITH labels(node) AS lbls, node
          UNWIND lbls AS label
          RETURN node {. *, label:label} AS node `;

        const params = {
            label: node.label,
            attributes: node.attributes,
        };
        delete params.attributes.nodeId;
        params.attributes.name = node.name;

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
        const query = `
          MATCH(node)
            WHERE node.nodeId = $nodeId
          WITH labels(node) AS lbls, properties(node) AS copyNode, node
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
        // language=Cypher
        const query = `
          MATCH(node)
            WHERE node.nodeId = $nodeId
          WITH labels(node) AS lbls, node
          UNWIND lbls AS label
          SET node = $attributes
          RETURN node{. *, label:label} AS node`;
        const params = {
            nodeId,
            attributes: node.attributes,
        };

        // Set id and name
        params.attributes["nodeId"] = nodeId;
        params.attributes["name"] = node.name;

        const resolveRead = async (res) => await this.dataSchemeUtil.parseNode(res.records[0]);
        return this.neo4jService
            .write(query, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Returns a specific node by id
     *
     * @param id The nodeId
     * @param includeDefaults True if the transformation should automatically place the defaults
     */
    async getNode(id: string, includeDefaults: boolean): Promise<Node> {
        // language=Cypher
        const query = `
          MATCH (n)
            WHERE n.nodeId = $id
          WITH labels(n) AS lbls, n
          UNWIND lbls AS label
          RETURN n {. *, label:label} AS node`;
        const params = {
            id,
        };

        // Callback which parses the received data
        const resolveRead = async (res) => await this.dataSchemeUtil.parseNode(res.records[0], includeDefaults);

        return this.neo4jService
            .read(query, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Return all nodes with limit and offset (pagination) from the neo4j db
     *
     * @param limit
     * @param offset
     * @param nameFilter
     * @param labelFilter
     */
    async getAllNodes(limit: number, offset: number, nameFilter: string, labelFilter: Array<string>): Promise<Node[]> {
        // Create the filter part of the cypher query
        const filter = await this.generateFilterString(nameFilter, labelFilter);

        // language=Cypher
        const query = `
          MATCH (n) ${filter}

          WITH labels(n) AS lbls, n
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
        const resolveRead = (result) =>
            Promise.all(result.records.map((el) => this.dataSchemeUtil.parseNode(el))).then((nodes) =>
                nodes.filter((node) => !!node),
            );

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
     */
    private async generateFilterString(nameFilter: string, labelFilter: string[]): Promise<string> {
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
