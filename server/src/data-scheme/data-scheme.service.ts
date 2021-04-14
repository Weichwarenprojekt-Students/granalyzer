import { Injectable, NotFoundException } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import { Scheme } from "./data-scheme.model";
import { RelationType } from "./models/relationType";
import { Attribute } from "./models/attributes";
import { Connection } from "./models/connection";
import { LabelScheme } from "./models/labelScheme";
import { DatabaseUtil } from "../util/database.util";
import Relation from "../relations/relation.model";

@Injectable()
export class DataSchemeService {
    /**
     * @private Configures the tool database
     */
    private readonly database = process.env.DB_TOOL;

    constructor(private readonly neo4jService: Neo4jService, private readonly databaseUtil: DatabaseUtil) {}

    /**
     * Parses the record to labels
     * @param record: record from the neo4j database
     * @private
     */
    private static parseLabelScheme(record: Record<any, any>): LabelScheme {
        const l = {
            ...record.get("dataScheme"),
        };
        l.attributes = JSON.parse(l.attributes, Attribute.reviver);
        return Object.assign(new LabelScheme(), l);
    }

    /**
     * Parses the record to relationTypes
     * @param record: record from the neo4j database
     * @private
     */
    private static parseRelationType(record: Record<any, any>): RelationType {
        const l = {
            ...record.get("dataScheme"),
        };

        l.attributes = JSON.parse(l.attributes, Attribute.reviver);
        l.connections = JSON.parse(l.connections).map((conn) => Object.assign(new Connection(), conn));

        return Object.assign(new RelationType(), l);
    }

    /**
     * Fetch all entries of the scheme
     */
    async getScheme(): Promise<Scheme> {
        return new Scheme(await this.getAllLabelSchemes(), await this.getAllRelationTypes());
    }

    /**
     * Fetch all labels of the scheme
     */
    async getAllLabelSchemes(): Promise<Array<LabelScheme>> {
        // language=cypher
        const cypher = `
          MATCH (ls:LabelScheme)
          RETURN ls {. *} AS dataScheme`;
        const params = {};

        // Callback function which is applied on the neo4j response
        const resolveRead = (res) => res.records.map(DataSchemeService.parseLabelScheme);

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Fetch the label with specific name
     */
    async getLabelScheme(name: string): Promise<LabelScheme> {
        // language=cypher
        const cypher = `
          MATCH (ls:LabelScheme)
            WHERE ls.name = $name
          RETURN ls {. *} AS dataScheme`;
        const params = {
            name,
        };

        // Callback function which is applied on the neo4j response
        const resolveRead = (res) => {
            if (!res.records.length) throw new NotFoundException("LabelScheme: " + name + " not found");
            return DataSchemeService.parseLabelScheme(res.records[0]);
        };

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Adds a new label scheme to the db
     */
    async addLabelScheme(label: LabelScheme): Promise<LabelScheme> {
        // language=Cypher
        const cypher = `
          CREATE (ls:LabelScheme {name: $name, color: $color, attributes: $attributes})
          RETURN ls {. *} AS dataScheme`;

        const params = {
            name: label.name,
            color: label.color,
            attributes: JSON.stringify(label.attributes),
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            return DataSchemeService.parseLabelScheme(res.records[0]);
        };

        return this.neo4jService
            .write(cypher, params, this.database)
            .then(resolveWrite)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Adds a new label scheme to the db
     */
    async updateLabelScheme(name: string, label: LabelScheme): Promise<LabelScheme> {
        // language=Cypher
        const cypher = `
          MATCH (ls:LabelScheme {name: $name})
          SET ls.color = $color, ls.attributes = $attributes
          RETURN ls {. *} AS dataScheme`;

        const params = {
            name,
            color: label.color,
            attributes: JSON.stringify(label.attributes),
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            return DataSchemeService.parseLabelScheme(res.records[0]);
        };

        return this.neo4jService
            .write(cypher, params, this.database)
            .then(resolveWrite)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Deletes a label scheme from the db
     */
    async deleteLabelScheme(name: string): Promise<LabelScheme> {
        // language=cypher
        const cypher = `
          MATCH (ls:LabelScheme {name: $name})
          WITH ls, properties(ls) AS copyLs
          DETACH DELETE ls
          RETURN copyLs {. *} AS dataScheme`;

        const params = {
            name,
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            if (!res.records[0]) throw new NotFoundException(`The label ${name} has not been found`);
            return DataSchemeService.parseLabelScheme(res.records[0]);
        };

        return this.neo4jService
            .write(cypher, params, this.database)
            .then(resolveWrite)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Fetch all relations
     */
    async getAllRelationTypes(): Promise<Array<RelationType>> {
        // language=cypher
        const cypher = "MATCH (rt:RelationType) RETURN rt {.*} AS dataScheme";
        const params = {};

        // Callback function which is applied on the neo4j response
        const resolveRead = (res) => res.records.map(DataSchemeService.parseRelationType);

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Fetch the relation with specific name
     */
    async getRelationType(name: string): Promise<RelationType> {
        // language=cypher
        const cypher = `
          MATCH (rt:RelationType)
            WHERE rt.name = $name
          RETURN rt {. *} AS dataScheme`;

        const params = {
            name,
        };

        // Callback function which is applied on the neo4j response
        const resolveRead = (res) => {
            if (!res.records.length) throw new NotFoundException("Relation: " + name + " not found");
            return DataSchemeService.parseRelationType(res.records[0]);
        };

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Adds a new relation type
     */
    async addRelationType(relationType: RelationType): Promise<RelationType> {
        // language=Cypher
        const cypher = `
          CREATE (rt:RelationType {name: $name, attributes: $attributes, connections: $connections})
          RETURN rt {. *} AS dataScheme`;

        const params = {
            name: relationType.name,
            attributes: JSON.stringify(relationType.attributes),
            connections: JSON.stringify(relationType.connections),
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            return DataSchemeService.parseRelationType(res.records[0]);
        };

        return this.neo4jService
            .write(cypher, params, this.database)
            .then(resolveWrite)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Adds a new label scheme to the db
     */
    async updateRelationType(name: string, relationType: RelationType): Promise<LabelScheme> {
        // language=Cypher
        const cypher = `
          MATCH (rt:RelationType {name: $name})
          SET rt.attributes = $attributes
          RETURN rt {. *} AS dataScheme`;

        const params = {
            name,
            attributes: JSON.stringify(relationType.attributes),
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            return DataSchemeService.parseRelationType(res.records[0]);
        };

        return this.neo4jService
            .write(cypher, params, this.database)
            .then(resolveWrite)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Deletes a relation type from the db
     */
    async deleteRelationType(name: string): Promise<Relation> {
        // language=cypher
        const cypher = `
          MATCH (rt:relationType {name: $name})
          WITH rt, properties(rt) AS copyRt
          DETACH DELETE rt
          RETURN copyRt {. *} AS dataScheme`;

        const params = {
            name,
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            if (!res.records[0]) throw new NotFoundException(`The relation type ${name} has not been found`);
            return DataSchemeService.parseRelationType(res.records[0]);
        };

        return this.neo4jService
            .write(cypher, params, this.database)
            .then(resolveWrite)
            .catch(this.databaseUtil.catchDbError);
    }
}
