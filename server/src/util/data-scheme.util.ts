import { Injectable, NotFoundException } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import Node from "../nodes/node.model";
import { Attribute } from "../data-scheme/models/attributes.model";
import Relation from "../relations/relation.model";
import { RelationType } from "../data-scheme/models/relation-type.model";
import { LabelScheme } from "../data-scheme/models/label-scheme.model";
import { Connection } from "../data-scheme/models/connection.model";
import { DatabaseUtil } from "./database.util";
import { Datatype } from "../data-scheme/models/data-type.model";
import { isHexColor, isNumber, isString } from "class-validator";
import * as neo4j from "neo4j-driver";
import { Record } from "neo4j-driver";

@Injectable()
export class DataSchemeUtil {
    /**
     * The name of the tool database
     */
    private readonly database = process.env.DB_TOOL;

    constructor(private readonly neo4jService: Neo4jService, private readonly databaseUtil: DatabaseUtil) {}

    /**
     * Converts an element according to a given label or relation scheme
     *
     * @param attribute The attribute scheme
     * @param element The attribute to be converted
     * @param includeDefaults True if the transformation should automatically place the defaults
     */
    public applyOnElement(attribute: Attribute, element: any, includeDefaults: boolean): string | number | undefined {
        if (!element && !attribute.mandatory) return undefined;

        // Check if element is a neo4j integer and try to parse
        if (element && element.low !== undefined && element.high !== undefined)
            element = neo4j.integer.toNumber(element);

        // Ensure the type is right
        switch (attribute.datatype) {
            case Datatype.NUMBER:
                if (isString(element)) element = parseFloat(element);
                if (!isNumber(element)) element = undefined;
                break;
            case Datatype.COLOR:
                if (!isHexColor(element)) element = undefined;
                break;
            case Datatype.STRING:
                if (element) element = element.toString();
        }

        // Insert the attribute's default value if necessary
        if (!element && attribute.mandatory && includeDefaults) return attribute["defaultValue"];

        return element;
    }

    /**
     * Parses the record to labels
     *
     * @param record Single record response from db
     */
    public parseLabelScheme(record: Record<any, any>): LabelScheme {
        const l = {
            ...record.get("dataScheme"),
        };
        l.attributes = JSON.parse(l.attributes, Attribute.reviver);
        return Object.assign(new LabelScheme(), l);
    }

    /**
     * Parses the record to relationTypes
     *
     * @param record Single record response from db
     */
    public parseRelationType(record: Record<any, any>): RelationType {
        const l = {
            ...record.get("dataScheme"),
        };

        l.attributes = JSON.parse(l.attributes, Attribute.reviver);
        l.connections = JSON.parse(l.connections).map((conn) => Object.assign(new Connection(), conn));

        return Object.assign(new RelationType(), l);
    }

    /**
     * Parse the db response into a Node
     *
     * @param record Single record response from db
     * @param includeDefaults True if the transformation should automatically place the defaults
     */
    public async parseNode(record: Record, includeDefaults = true): Promise<Node> {
        // Throw exception if there is no such node in DB
        if (!record) throw new NotFoundException("No results to return");

        const queryKey = "node";
        const attributes = record.get(queryKey);
        const node = {
            nodeId: record.get(queryKey).nodeId,
            name: record.get(queryKey).name,
            label: record.get(queryKey).label,
            attributes: attributes,
        } as Node;

        // Gets the label scheme which matches the nodes label name
        let label: LabelScheme;

        try {
            label = await this.getLabelScheme(node.label);
        } catch {
            return;
        }

        // Parse attributes which are contained in the scheme of the node label
        node.attributes = this.transformAttributes(label, node.attributes, includeDefaults);

        return node;
    }

    /**
     * Parse record from the database as relation
     *
     * @param record Single record response from db
     * @param includeDefaults True if the transformation should automatically place the defaults
     */
    async parseRelation(record: Record, includeDefaults = true): Promise<Relation> {
        // Throw exception if there is no such relation in DB
        if (!record) throw new NotFoundException("No results to return");

        const queryKey = "relation";
        const attributes = record.get(queryKey);
        const relation = {
            relationId: record.get(queryKey).relationId,
            type: record.get(queryKey).type,
            from: record.get(queryKey).from,
            to: record.get(queryKey).to,
            attributes: attributes,
        } as Relation;

        // Get the relation information (to check if relation is invalid)
        let relationType: RelationType;
        let from: string, to: string;
        try {
            // Try to get the scheme of the passed relation type
            relationType = await this.getRelationType(relation.type);

            // Try to get the labels for the connected nodes
            [from, to] = await this.getLabelsForRelation(relation);
        } catch {
            return;
        }

        // Check if the relation has a valid connection according to the scheme of the relation type
        const hasValidConnection = relationType.connections.some((conn) => conn.from === from && conn.to === to);
        if (!hasValidConnection) return;

        // Deep copy of attributes
        const relationAttributes = JSON.parse(JSON.stringify(relation.attributes));

        // Parse attributes which are contained in the scheme of the relation type
        relation.attributes = this.transformAttributes(relationType, relationAttributes, includeDefaults);
        return relation;
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
            return this.parseRelationType(res.records[0]);
        };

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
            return this.parseLabelScheme(res.records[0]);
        };

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Transform attributes of nodes or relations according to the scheme
     *
     * @param scheme Scheme data
     * @param originalAttributes The original attributes of the node or relation
     * @param includeDefaults True if the transformation should automatically place the defaults
     */
    private transformAttributes(
        scheme: LabelScheme | RelationType,
        originalAttributes: Attribute[],
        includeDefaults = true,
    ) {
        const attributes = {};
        scheme.attributes.forEach((attribute) => {
            attributes[attribute.name] = this.applyOnElement(
                attribute,
                originalAttributes[attribute.name],
                includeDefaults,
            );
        });
        return attributes;
    }

    /**
     * Get Labels of the start and end nodes of a relation
     *
     * @param relation The relation
     */
    private async getLabelsForRelation(relation: Relation): Promise<[string, string]> {
        // language=cypher
        const cypher = "MATCH (s)-[r]->(e) WHERE r.relationId = $id RETURN s, e";
        const params = {
            id: relation.relationId,
        };

        const result = await this.neo4jService.read(cypher, params, process.env.DB_CUSTOMER);
        if (!result.records.length)
            throw new NotFoundException("Could not fetch the node labels of relation " + relation.type);

        return [result.records[0].get("s").labels[0], result.records[0].get("e").labels[0]];
    }
}
