import { Injectable } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import { DataSchemeUtil } from "../util/data-scheme.util";
import { DatabaseUtil } from "../util/database.util";
import Relation from "./relation.model";

@Injectable()
export class RelationsService {
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
     * Return all relations
     */
    async getAllRelations(): Promise<Relation[]> {
        // language=cypher
        const query = `MATCH(startNode)-[relation]->(endNode)
                       WITH startNode.nodeId AS from, 
                            endNode.nodeId AS to, relation 
                       RETURN relation { .*, type:TYPE(relation), from:from, to:to} as relation;`;
        const params = {};

        // Callback which parses the received data
        const resolveRead = async (res) =>
            Promise.all(res.records.map((el) => this.dataSchemeUtil.parseRelation(el, "relation")));

        return this.neo4jService
            .read(query, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Returns a specific relation by id
     */
    async getRelation(id: string): Promise<Relation> {
        // language=cypher
        const query = `MATCH(startNode)-[relation]->(endNode) 
                         WHERE relation.relationId = $id
                       WITH startNode.nodeId AS from,
                            endNode.nodeId AS to, relation
                       RETURN relation { .*, type:TYPE(relation), from:from, to:to} as relation;`;
        const params = { id };

        // Callback which parses the received data
        const resolveRead = async (res) => await this.dataSchemeUtil.parseRelation(res.records[0], "relation");

        return this.neo4jService
            .read(query, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }
}
