import { Injectable } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import Relation from "../relations/relation.model";
import { DataSchemeUtil } from "../util/data-scheme.util";

@Injectable()
export class NodesRelationsService {
    /**
     * Customer database
     */
    private database = process.env.DB_CUSTOMER;

    constructor(private readonly neo4jService: Neo4jService, private readonly dataSchemeUtil: DataSchemeUtil) {}

    /**
     * Get all relations that are connected to a certain node
     *
     * @param id The id of the node
     */
    async getRelationsOfNode(id: number): Promise<Relation[]> {
        // language=cypher
        const cypher = "MATCH (n)-[r]-() WHERE id(n) = $id RETURN DISTINCT r";
        const params = {
            id: this.neo4jService.int(id),
        };

        const result = await this.neo4jService.read(cypher, params, this.database);
        return Promise.all(result.records.map(async (rec) => await this.parseRelation.call(this, rec)));
    }

    /**
     * Parse record from the database as relation
     *
     * @param record The record
     * @param queryKey The key of the record as specified in the query
     * @private
     */
    private async parseRelation(record, queryKey = "r"): Promise<Relation> {
        const attributes = record.get(queryKey).properties;

        const relation = {
            id: record.get(queryKey).identity.toNumber(),
            type: record.get(queryKey).type,
            from: record.get(queryKey).start.toNumber(),
            to: record.get(queryKey).end.toNumber(),
            attributes: attributes,
        } as Relation;

        return this.dataSchemeUtil.parseRecordByRelationType(relation);
    }
}
