import { Injectable, NotFoundException } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import * as neo4j from "neo4j-driver";
import { Attribute } from "./models/attributes";
import { Label } from "./models/label";
import { RelationType } from "./models/relationType";
import { Scheme } from "./data-scheme.model";
import { Connection } from "./models/connection";
import { UtilsNode } from "../util/utils.node";

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
    private static parseLabel(record: Record<any, any>): Label {
        const l = {
            ...record.get("dataScheme").properties,
            id: record.get("dataScheme").identity.toNumber(),
        };
        l.attributes = JSON.parse(l.attributes, Attribute.reviver);
        return Object.assign(new Label(), l);
    }

    /**
     * Parses the record to relationTypes
     * @param record: record from the neo4j database
     * @private
     */
    private static parseRelation(record: Record<any, any>): RelationType {
        const l = {
            ...record.get("dataScheme").properties,
            id: record.get("dataScheme").identity.toNumber(),
        };
        l.attributes = JSON.parse(l.attributes, Attribute.reviver);
        l.connections = JSON.parse(l.connections).map((conn) => Object.assign(new Connection(), conn));

        return Object.assign(new RelationType(), l);
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
        const cypher = "MATCH (ls:LabelScheme) RETURN ls AS dataScheme";
        const params = {};

        return this.neo4jService
            .read(cypher, params, this.database)
            .then((res) => res.records.map(DataSchemeService.parseLabel));
    }

    /**
     * Fetch the label with id id
     * @param id
     */
    async getLabel(id: number) {
        await this.utilsNode.checkElementForLabel(id, "LabelScheme");

        // language=cypher
        const cypher = "MATCH (ls:LabelScheme) WHERE id(ls) = $id RETURN ls AS dataScheme";
        const params = {
            id: neo4j.int(id),
        };

        return this.neo4jService.read(cypher, params, this.database).then((res) => {
            if (!res.records.length) {
                throw new NotFoundException("Label with id: " + id + " not found");
            }
            return DataSchemeService.parseLabel(res.records[0]);
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
        const cypher = "MATCH (rt:RelationType) RETURN rt AS dataScheme";
        const params = {};

        return this.neo4jService
            .read(cypher, params, this.database)
            .then((res) => res.records.map(DataSchemeService.parseRelation));
    }

    /**
     * Fetch the relation with id id
     * @param id
     */
    async getRelation(id: number) {
        await this.utilsNode.checkElementForLabel(id, "RelationType");

        // language=cypher
        const cypher = "MATCH (rt:RelationType) WHERE id(rt) = $id RETURN rt AS dataScheme";
        const params = {
            id: neo4j.int(id),
        };

        return this.neo4jService.read(cypher, params, this.database).then((res) => {
            if (!res.records.length) {
                throw new NotFoundException("Relation with id: " + id + " not found");
            }
            return DataSchemeService.parseRelation(res.records[0]);
        });
    }
}
