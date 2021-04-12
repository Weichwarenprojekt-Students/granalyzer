import { Injectable, NotFoundException } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import { Scheme } from "./data-scheme.model";
import { RelationType } from "./models/relationType";
import { Attribute } from "./models/attributes";
import { Connection } from "./models/connection";
import { LabelScheme } from "./models/labelScheme";
import { DatabaseUtil } from "../util/database.util";

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
    async getScheme() {
        return new Scheme(await this.getAllLabelSchemes(), await this.getAllRelationTypes());
    }

    /**
     * Fetch all labels of the scheme
     */
    async getAllLabelSchemes() {
        // language=cypher
        const cypher = "MATCH (ls:LabelScheme) RETURN ls {.*} AS dataScheme";
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
     * @param name
     */
    async getLabelScheme(name: string) {
        // language=cypher
        const cypher = "MATCH (ls:LabelScheme) WHERE ls.name = $name RETURN ls {.*} AS dataScheme";
        const params = {
            name,
        };

        // Callback function which is applied on the neo4j response
        const resolveRead = (res) => {
            if (!res.records.length) {
                throw new NotFoundException("LabelScheme: " + name + " not found");
            }
            return DataSchemeService.parseLabelScheme(res.records[0]);
        };

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Fetch all relations
     */
    async getAllRelationTypes() {
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
     * @param name
     */
    async getRelationType(name: string) {
        // language=cypher
        const cypher = "MATCH (rt:RelationType) WHERE rt.name = $name RETURN rt {.*} AS dataScheme";
        const params = {
            name,
        };

        // Callback function which is applied on the neo4j response
        const resolveRead = (res) => {
            if (!res.records.length) {
                throw new NotFoundException("Relation: " + name + " not found");
            }
            return DataSchemeService.parseRelationType(res.records[0]);
        };

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }
}
