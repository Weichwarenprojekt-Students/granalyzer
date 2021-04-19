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
        const query = `
          MATCH(startNode)-[relation]->(endNode)
          WITH startNode.nodeId AS from,
               endNode.nodeId AS to, relation
          RETURN relation {. *, type:type(relation), from:from, to:to} AS relation;`;
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
        const query = `
          MATCH(startNode)-[relation]->(endNode)
            WHERE relation.relationId = $id
          WITH startNode.nodeId AS from,
               endNode.nodeId AS to, relation
          RETURN relation {. *, type:type(relation), from:from, to:to} AS relation;`;
        const params = { id };

        // Callback which parses the received data
        const resolveRead = async (res) => await this.dataSchemeUtil.parseRelation(res.records[0], "relation");

        return this.neo4jService
            .read(query, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Creates a relation with a given type between two given nodes
     */
    async addRelation(type: string, from: string, to: string): Promise<Relation> {
        // TODO :: Check if type is valid
        // language=cypher
        const query = `
          MATCH (from)
          WITH from
          MATCH (to)
            WHERE from.nodeId = $from AND to.nodeId = $to
          CREATE(from)-[relation:${type} {relationId: apoc.create.uuid()}]->(to)
          RETURN relation {. *, type:type(relation), from:from, to:to} AS relation;`;

        const params = {
            from: from,
            to: to,
            type: type,
        };

        // Callback which parses the received data
        const resolveRead = async (res) => await this.dataSchemeUtil.parseRelation(res.records[0], "relation");

        return await this.neo4jService
            .write(query, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }
}
