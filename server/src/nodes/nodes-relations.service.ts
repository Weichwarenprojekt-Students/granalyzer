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
          CALL db.index.fulltext.queryNodes("allNodesIndex", $nodeId) YIELD node AS n
          MATCH (n)-[r]-(m)
          RETURN r {.*, type:type(r), from:startNode(r).nodeId, to:endNode(r).nodeId}
        `;
        const params = {
            id,
            nodeId: `\'\"${id}\"\'`,
        };

        // Callback parsing the received data from the db write call
        const resolveRead = (result) => {
            const relations = result.records.map(async (rec) => await this.dataSchemeUtil.parseRelation(rec));
            // Filter relations which are not allowed by the scheme
            return Promise.all(relations).then((res) => res.filter((el) => !!el));
        };

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }
}
