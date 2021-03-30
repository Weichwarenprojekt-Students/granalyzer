import { Injectable } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import Node from "./node.model";

@Injectable()
export class NodesService {
    private database = process.env.DB_CUSTOMER;

    constructor(private readonly neo4jService: Neo4jService) {}

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
        return this.neo4jService
            .read(query, params, this.database)
            .then((res) => res.records.map(NodesService.parseNode));
    }

    /**
     * Parse the db response into a Node
     *
     * @param record single record response from db
     * @private
     */
    private static parseNode(record) {
        const attributes = record.get("n").properties;
        delete attributes.name;

        return {
            id: record.get("n").identity.toNumber(),
            name: record.get("n").properties.name,
            label: record.get("n").label,
            attributes: attributes,
        } as Node;
    }
}
