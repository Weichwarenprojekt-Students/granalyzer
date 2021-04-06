import { Injectable, NotFoundException } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import { Scheme } from "./data-scheme.model";
import { RelationType } from "./models/relationType";
import { Attribute } from "./models/attributes";
import { Connection } from "./models/connection";
import { Label } from "./models/label";

@Injectable()
export class DataSchemeService {
    /**
     * @private Configures the tool database
     */
    private readonly database = process.env.DB_TOOL;

    constructor(private readonly neo4jService: Neo4jService) {}

    /**
     * Parses the record to labels
     * @param record: record from the neo4j database
     * @private
     */
    private static parseLabel(record: Record<any, any>): Label {
        record.attributes = JSON.parse(record.attributes, Attribute.reviver);
        return Object.assign(new Label(), record);
    }

    /**
     * Parses the record to relationTypes
     * @param record: record from the neo4j database
     * @private
     */
    private static parseRelation(record: Record<any, any>): RelationType {
        record.attributes = JSON.parse(record.attributes, Attribute.reviver);
        record.connections = JSON.parse(record.connections).map((conn) => Object.assign(new Connection(), conn));

        return Object.assign(new RelationType(), record);
    }

    /**
     * Fetch all entries of the scheme
     */
    async getScheme() {
        return new Scheme(await this.getAllLabel(), await this.getAllRelations());
    }

    /**
     * Fetch all labels of the scheme
     */
    async getAllLabel() {
        // language=cypher
        const cypher = "MATCH (ls:LabelScheme) RETURN ls {.*} AS dataScheme";
        const params = {};

        return this.neo4jService
            .read(cypher, params, this.database)
            .then((res) => res.records.map((record) => DataSchemeService.parseLabel(record.get("dataScheme"))));
    }

    /**
     * Fetch the label with id id
     * @param id
     */
    async getLabel(id: string) {
        // language=cypher
        const cypher = "MATCH (ls:LabelScheme) WHERE ls.labelId = $id RETURN ls {.*} AS dataScheme";
        const params = {
            id,
        };

        return this.neo4jService.read(cypher, params, this.database).then((res) => {
            if (!res.records.length) {
                throw new NotFoundException("Label with id: " + id + " not found");
            }
            return DataSchemeService.parseLabel(res.records[0].get("dataScheme"));
        });
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
    async getAllRelations() {
        // language=cypher
        const cypher = "MATCH (rt:RelationType) RETURN rt {.*} AS dataScheme";
        const params = {};

        return this.neo4jService
            .read(cypher, params, this.database)
            .then((res) => res.records.map((record) => DataSchemeService.parseRelation(record.get("dataScheme"))));
    }

    /**
     * Fetch the relation with id id
     * @param id
     */
    async getRelation(id: string) {
        // language=cypher
        const cypher = "MATCH (rt:RelationType) WHERE rt.relationId = $id RETURN rt {.*} AS dataScheme";
        const params = {
            id,
        };

        return this.neo4jService.read(cypher, params, this.database).then((res) => {
            if (!res.records.length) {
                throw new NotFoundException("Relation with id: " + id + " not found");
            }
            return DataSchemeService.parseRelation(res.records[0].get("dataScheme"));
        });
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
