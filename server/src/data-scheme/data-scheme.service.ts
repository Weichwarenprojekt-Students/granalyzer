import { HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import { Scheme } from "./data-scheme.model";
import { RelationType } from "./models/relationType";
import { Attribute } from "./models/attributes";
import { Connection } from "./models/connection";
import { LabelScheme } from "./models/labelScheme";
import { UtilsNode } from "../util/utils.node";
import { Label } from "../../dist/src/data-scheme/models/label";

@Injectable()
export class DataSchemeService {
    /**
     * @private Configures the tool database
     */
    private readonly database = process.env.DB_TOOL;

    constructor(private readonly neo4jService: Neo4jService, private readonly utilsNode: UtilsNode) {}

    /**
     * Parses the record to labels
     * @param record: record from the neo4j database
     * @private
     */
    private static parseLabelScheme(record: Record<any, any>): LabelScheme {
        record.attributes = JSON.parse(record.attributes, Attribute.reviver);
        return Object.assign(new LabelScheme(), record);
    }

    /**
     * Parses the record to relationTypes
     * @param record: record from the neo4j database
     * @private
     */
    private static parseRelationType(record: Record<any, any>): RelationType {
        record.attributes = JSON.parse(record.attributes, Attribute.reviver);
        record.connections = JSON.parse(record.connections).map((conn) => Object.assign(new Connection(), conn));

        return Object.assign(new RelationType(), record);
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
        const resolveRead = (res) =>
            res.records.map((record) => DataSchemeService.parseLabelScheme(record.get("dataScheme")));

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.utilsNode.catchDbError);
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
            return DataSchemeService.parseLabelScheme(res.records[0].get("dataScheme"));
        };

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.utilsNode.catchDbError);
    }

    /**
     * Returns the label with the name name
     * @param name
     */
    async getLabelByName(name: string): Promise<Label> {
        // language=cypher
        const cypher = "MATCH (ls:LabelScheme) WHERE ls.name = $name RETURN ls AS dataScheme";
        const params = {
            name,
        };

        return this.neo4jService.read(cypher, params, this.database).then((res) => {
            if (!res.records.length) {
                throw new NotFoundException("Label with name: " + name + " not found");
            }
            return DataSchemeService.parseLabel(res.records[0]);
        });
    }

    /**
     * Fetch all relations
     */
    async getAllRelationTypes() {
        // language=cypher
        const cypher = "MATCH (rt:RelationType) RETURN rt {.*} AS dataScheme";
        const params = {};

        // Callback function which is applied on the neo4j response
        const resolveRead = (res) =>
            res.records.map((record) => DataSchemeService.parseRelationType(record.get("dataScheme")));

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.utilsNode.catchDbError);
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
            return DataSchemeService.parseRelationType(res.records[0].get("dataScheme"));
        };

        return this.neo4jService.read(cypher, params, this.database).then(resolveRead);
    }

    /**
     * Acquire the desired relation type
     *
     * @param name The name of the desired relation type
     */
    async getRelationTypeByName(name: string): Promise<RelationType> {
        // language=cypher
        const cypher = "MATCH (rt:RelationType) WHERE rt.name = $name RETURN rt AS dataScheme";
        const params = {
            name,
        };

        return this.neo4jService.read(cypher, params, this.database).then((res) => {
            if (!res.records.length) {
                throw new NotFoundException("Label with name: " + name + " not found");
            }
            return DataSchemeService.parseRelation(res.records[0]);
        });
    }
}
