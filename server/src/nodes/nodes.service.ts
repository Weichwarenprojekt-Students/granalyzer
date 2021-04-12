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
     * Return all nodes with limit and offset (pagination) from the neo4j db
     * @param limit
     * @param offset
     */
    async getAllNodes(limit, offset): Promise<Node[]> {
        // language=Cypher
        const query = `
          MATCH (n)
          WITH labels(n) AS lbls, n
          UNWIND lbls AS label
          RETURN n {. *, label:label} AS node
            ORDER BY n.name
            SKIP $offset
            LIMIT $limit`;
        const params = {
            limit: this.neo4jService.int(limit),
            offset: this.neo4jService.int(offset),
        };

        // Callback which is applied on the database response
        const resolveRead = (result) => Promise.all(result.records.map((el) => this.parseNode.call(this, el)));

        return this.neo4jService
            .read(query, params, this.database)
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
          WITH labels(n) AS lbls, n
          UNWIND lbls AS label
          RETURN n {. *, label:label} AS node`;
        const params = {
            id,
        };

        // Callback which parses the received data
        const resolveRead = async (res) => await this.parseNode.call(this, res.records[0]);

        return this.neo4jService
            .read(query, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Returns all nodes with the name like name
     * @param needle
     */
    async searchNode(needle: string): Promise<Node[]> {
        // language=Cypher
        const query = `
          MATCH(n)
            WHERE toLower(n.name) CONTAINS toLower($needle)
          WITH labels(n) AS lbls, n
          UNWIND lbls AS label
          RETURN n {. *, label:label} AS node`;
        const params = {
            needle,
        };

        // Callback which is applied on the database response
        const resolveRead = (result) => Promise.all(result.records.map((el) => this.parseNode.call(this, el)));

        return this.neo4jService
            .read(query, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Parse the db response into a Node
     * @param record single record response from db
     * @private
     */
    private async parseNode(record): Promise<Node> {
        const attributes = record.get("node");

        const node = {
            nodeId: record.get("node").nodeId,
            name: record.get("node").name,
            label: record.get("node").label,
            attributes: attributes,
        } as Node;

        delete node["attributes"]["nodeId"];

        return this.dataSchemeUtil.parseRecordByLabel(node);
    }
}
