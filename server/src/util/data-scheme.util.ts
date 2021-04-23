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
import * as neo4j from "neo4j-driver";
import { isHexColor, isNumber } from "class-validator";

@Injectable()
export class DataSchemeUtil {
    /**
     * The name of the tool database
     */
    private readonly database = process.env.DB_TOOL;

    constructor(private readonly neo4jService: Neo4jService, private readonly databaseUtil: DatabaseUtil) {}

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
     * @param queryKey The key of the record as specified in the query
     * @param labelScheme The label scheme of the node
     */
    public async parseNode(record?, queryKey = "node", labelScheme?: LabelScheme): Promise<Node> {
        // Throw exception if there is no such node in DB
        if (!record) throw new NotFoundException("No results to return");

        const attributes = record.get(queryKey);
        const node = {
            nodeId: record.get(queryKey).nodeId,
            name: record.get(queryKey).name,
            label: record.get(queryKey).label,
            attributes: attributes,
        } as Node;

        // If node is valid parse it, else return nothing
        return this.parseRecordByLabel(node, labelScheme);
    }

    /**
     * Checks the node if it is valid to the scheme
     *
     * @param node The node that shall be parsed
     * @param labelScheme The label scheme of the node
     */
    async parseRecordByLabel(node: Node, labelScheme?: LabelScheme): Promise<Node> | undefined {
        try {
            // Gets the label scheme which matches the nodes label name
            const label: LabelScheme = labelScheme ?? (await this.getLabelScheme(node.label));

            // Deep copy all attributes from the node
            const nodeAttributes = JSON.parse(JSON.stringify(node.attributes));
            // Deletes the node Attributes
            node.attributes = this.transformAttributes(label, nodeAttributes);

            return node;
        } catch (ex) {
            return;
        }
    }

    /**
     * Parse record from the database as relation
     *
     * @param record The record
     * @param queryKey The key of the record as specified in the query
     * @private
     */
    async parseRelation(record?, queryKey = "r"): Promise<Relation> {
        if (!record) throw new NotFoundException("No results to return");

        const attributes = record.get(queryKey);

        const relation = {
            relationId: record.get(queryKey).relationId,
            type: record.get(queryKey).type,
            from: record.get(queryKey).from,
            to: record.get(queryKey).to,
            attributes: attributes,
        } as Relation;

        return this.parseRecordByRelationType(relation);
    }

    /**
     * Parse the relation according to the data scheme
     *
     * @param relation The relation
     */
    async parseRecordByRelationType(relation: Relation): Promise<Relation> | undefined {
        try {
            // Get the scheme of the relation type
            const relationType: RelationType = await this.getRelationType(relation.type);

            const [from, to] = await this.getLabelsForRelation(relation);

            // Check if the relation has a valid connection according to the scheme of the relation type
            const hasValidConnection = relationType.connections.some((conn) => conn.from === from && conn.to === to);
            if (!hasValidConnection) return;

            // Deep copy of attributes
            const relationAttributes = JSON.parse(JSON.stringify(relation.attributes));

            // Parse attributes which are contained in the scheme of the relation type
            relation.attributes = this.transformAttributes(relationType, relationAttributes);

            return relation;
        } catch (ex) {
            return;
        }
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
     * Transform attributes of nodes or relations according to the scheme
     *
     * @param scheme Scheme data
     * @param originalAttributes The original attributes of the node or relation
     */
    private transformAttributes(scheme: LabelScheme | RelationType, originalAttributes) {
        const attributes = {};
        scheme.attributes.forEach((attribute) => {
            attributes[attribute.name] = this.applyOnElement(attribute, originalAttributes[attribute.name]);
        });
        return attributes;
    }

    /**
     * Converts an element according to a given label or relation scheme
     *
     * @param attribute The attribute scheme
     * @param element The attribute to be converted
     */
    private applyOnElement(attribute: Attribute, element: any) {
        if (!element && !attribute.mandatory) return undefined;
        if (!element && attribute.mandatory) {
            return attribute["defaultValue"];
        }
        switch (attribute.datatype) {
            case Datatype.NUMBER:
                // Try casting to number if element is neo4j long which cannot be displayed in JS
                if (element && element.low !== undefined && element.high !== undefined)
                    element = neo4j.integer.toNumber(element);
                // Check if element can be parsed to a number, set it to undefined if not
                else {
                    const parsed = parseFloat(element);
                    if (isNaN(parsed)) {
                        element = attribute.mandatory ? attribute.defaultValue : undefined;
                    } else element = parsed;
                }
                break;
            case Datatype.COLOR:
                if (!isHexColor(element)) element = attribute.mandatory ? attribute.defaultValue : undefined;
                break;
            case Datatype.STRING:
                // Try to cast neo4j-long into string
                if (element && element.low !== undefined && element.high !== undefined)
                    element = neo4j.integer.toString(element);
                else if (typeof element != "string") element = attribute.mandatory ? attribute.defaultValue : undefined;
        }
        return element;
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
     * Check if an attribute in a node has a conflict
     *
     * @param attr The attribute to be checked
     * @param node The node to be checked
     * @return True if the attribute has a conflict
     */
    hasConflict(attr: Attribute, node: Node): boolean {
        switch (attr.datatype) {
            case Datatype.NUMBER:
                return !isNumber(node.attributes[attr.name]);
            case Datatype.COLOR:
                return !isHexColor(node.attributes[attr.name]);
            default:
                return false;
        }
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
