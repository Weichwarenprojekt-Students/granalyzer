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
     * Creates a relation with a given type between two given nodes
     * @param relation The relation to be created
     */
    async createRelation(relation: Relation): Promise<Relation> {
        // language=Cypher
        const query = `
          MATCH (from) 
          WITH from
          MATCH (to)
            WHERE from.nodeId = $from AND to.nodeId = $to
            CALL apoc.create.relationship(from, $type, {}, to) YIELD rel AS relation
          SET relation.relationId = apoc.create.uuid(), relation +=$attributes
          RETURN relation {. *, type:type(relation), from:from.nodeId, to:to.nodeId} AS relation;`;

        const params = {
            type: relation.type,
            from: relation.from,
            to: relation.to,
            attributes: relation.attributes,
        };
        delete params.attributes.relationId;

        // Callback which parses the received data
        const resolveRead = async (res) => await this.dataSchemeUtil.parseRelation(res.records[0], "relation");

        return await this.neo4jService
            .write(query, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Modifies the attributes of the specified relation
     * @param relationId The UUID of the relation
     * @param relation The node to be modified
     */
    modifyRelation(relationId: string, relation: Relation): Promise<Relation> {
        //language=Cypher
        const query = `MATCH(startNode)-[relation]->(endNode)
                         WHERE relation.relationId = $relationId
                       WITH startNode.nodeId AS from,
                            endNode.nodeId AS to, relation
                       SET relation = $attributes
                       RETURN relation { .*, type:TYPE(relation), from:from, to:to} as relation;`;
        const params = {
            relationId,
            attributes: relation.attributes,
        };

        // Set the id
        params.attributes["relationId"] = relationId;

        const resolveRead = async (res) => await this.dataSchemeUtil.parseRelation(res.records[0], "relation");
        return this.neo4jService
            .write(query, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Deletes the specified relation by id
     * @param relationId
     */
    async deleteRelation(relationId: string): Promise<Relation> {
        // Backup the relation to return
        const relation = await this.getRelation(relationId);

        // language=Cypher
        const query = `MATCH(startNode)-[relation]-(endNode) 
                         WHERE relation.relationId=$relationId
                       DELETE relation;`;
        const params = {
            relationId,
        };

        await this.neo4jService.write(query, params, this.database).catch(this.databaseUtil.catchDbError);
        return relation;
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
}
