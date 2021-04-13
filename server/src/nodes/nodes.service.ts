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
     * @param nameFilter
     * @param labelFilter
     */
    async getAllNodes(
        limit: number,
        offset: number,
        nameFilter?: string,
        labelFilter?: Array<string>,
    ): Promise<Node[]> {
        const filter = this.generateFilterString(nameFilter, labelFilter);

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

    /**
     * Generate a string to filter nodes by
     *
     * @param nameFilter Name to filter by
     * @param labelFilter Labels to filter by
     * @private
     */
    private generateFilterString(nameFilter?: string, labelFilter?: Array<string>): string {
        let filter = "";

        if (nameFilter) filter = "WHERE toLower(n.name) CONTAINS toLower($nameFilter) ";

        if (labelFilter.length !== 0) {
            filter += nameFilter ? "AND " : "WHERE ";
            if (Array.isArray(labelFilter)) {
                filter += "(";
                labelFilter.forEach((label, index) => {
                    filter += index == labelFilter.length - 1 ? `n:${label}) ` : `n:${label} OR `;
                });
            } else filter += `n:${labelFilter} `;
        }
        return filter;
    }
}
