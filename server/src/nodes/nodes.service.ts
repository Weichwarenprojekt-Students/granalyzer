import { Injectable } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import Node from "./node.model";
import { DataSchemeUtil } from "../util/data-scheme.util";

@Injectable()
export class NodesService {
    private database = process.env.DB_CUSTOMER;

    constructor(private readonly neo4jService: Neo4jService, private readonly dataSchemeUtil: DataSchemeUtil) {}

    /**
     * Return all nodes with limit and offset (pagination) from the neo4j db
     * @param limit
     * @param offset
     */
    async getAllNodes(limit, offset): Promise<Node[]> {
        // language=Cypher
        const query = "MATCH (n) RETURN n ORDER BY n.name SKIP $offset LIMIT $limit";
        const params = {
            limit: this.neo4jService.int(limit),
            offset: this.neo4jService.int(offset),
        };
        const result = await this.neo4jService.read(query, params, this.database);
        return Promise.all(result.records.map((el) => this.parseNode.call(this, el)));
    }

    /**
     * Returns a specific node by id
     */
    async getNode(id: number): Promise<Node> {
        // language=Cypher
        const query = "MATCH (n) WHERE id(n) = $id RETURN n";
        const params = {
            id: this.neo4jService.int(id),
        };
        const result = await this.neo4jService.read(query, params, this.database);
        return this.parseNode.call(this, result.records[0]);
    }

    /**
     * Returns all nodes with the name like name
     * @param needle
     */
    async searchNode(needle: string): Promise<Node[]> {
        // language=Cypher
        const query = "MATCH(n) WHERE toLower(n.name) CONTAINS toLower($needle) RETURN n";
        const params = {
            needle,
        };

        const result = await this.neo4jService.read(query, params, this.database);
        return Promise.all(result.records.map((el) => this.parseNode.call(this, el)));
    }

    /**
     * Parse the db response into a Node
     * @param record single record response from db
     * @private
     */
    private async parseNode(record): Promise<Node> {
        const attributes = record.get("n").properties;

        const node = {
            id: record.get("n").identity.toNumber(),
            name: record.get("n").properties.name,
            label: record.get("n").labels[0],
            attributes: attributes,
        } as Node;

        return this.dataSchemeUtil.parseRecordByLabel(node);
    }
}
