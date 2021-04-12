import { Injectable } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import Relation from "../relations/relation.model";
import { DataSchemeUtil } from "../util/data-scheme.util";
import { DatabaseUtil } from "../util/database.util";

@Injectable()
export class NodesRelationsService {
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
     * Get all relations that are connected to a certain node
     *
     * @param id The id of the node
     */
    async getRelationsOfNode(id: string): Promise<Relation[]> {
        // language=Cypher
        const cypher = `
          MATCH (n)-[r]-(e)
            WHERE n.nodeId = $id
          RETURN DISTINCT r {. *, type:type(r), from:n.nodeId, to:e.nodeId} AS r`;
        const params = {
            id,
        };

        // Callback parsing the received data from the db write call
        const resolveRead = (result) => {
            return Promise.all(result.records.map(async (rec) => await this.parseRelation.call(this, rec)));
        };

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Parse record from the database as relation
     *
     * @param record The record
     * @param queryKey The key of the record as specified in the query
     * @private
     */
    private async parseRelation(record, queryKey = "r"): Promise<Relation> {
        const attributes = record.get(queryKey);

        const relation = {
            relationId: record.get(queryKey).relationId,
            type: record.get(queryKey).type,
            from: record.get(queryKey).from,
            to: record.get(queryKey).to,
            attributes: attributes,
        } as Relation;

        return this.dataSchemeUtil.parseRecordByRelationType(relation);
    }
}
