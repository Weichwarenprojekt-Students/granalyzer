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
        if (!record) throw new NotFoundException("No results to return");

        const attributes = record.get(queryKey);

        const node = {
            nodeId: record.get(queryKey).nodeId,
            name: record.get(queryKey).name,
            label: record.get(queryKey).label,
            attributes: attributes,
        } as Node;

        return this.parseRecordByLabel(node, labelScheme);
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
     * Checks the node if it is valid to the scheme
     *
     * @param node The node that shall be parsed
     * @param labelScheme The label scheme of the node
     */
    async parseRecordByLabel(node: Node, labelScheme?: LabelScheme) {
        // Gets the label scheme which matches the nodes label name
        const label: LabelScheme = labelScheme ?? (await this.getLabelScheme(node.label));
        // Deep copy all attributes from the node
        const nodeAttributes = JSON.parse(JSON.stringify(node.attributes));
        // Deletes the node Attributes
        node.attributes = this.transformAttributes(label, nodeAttributes);

        return node;
    }

    /**
     * Parse the relation according to the data scheme
     *
     * @param relation The relation
     */
    async parseRecordByRelationType(relation: Relation) {
        // Get the scheme of the relation type
        const relationType: RelationType = await this.getRelationType(relation.type);

        const [from, to] = await this.getLabelsForRelation(relation);

        // Check if the relation has a valid connection according to the scheme of the relation type
        const hasValidConnection = relationType.connections.some((conn) => conn.from === from && conn.to === to);

        // If not valid skip
        if (!hasValidConnection) {
            return;
        }

        // Deep copy of attributes
        const relationAttributes = JSON.parse(JSON.stringify(relation.attributes));

        // Parse attributes which are contained in the scheme of the relation type
        relation.attributes = this.transformAttributes(relationType, relationAttributes);

        return relation;
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
     * Check if an attribute in a node has a conflict
     *
     * @param attr The attribute to be checked
     * @param node The node to be checked
     * @return True if the attribute has a conflict
     */
    hasConflict(attr: Attribute, node: Node): boolean {
        switch (attr.datatype) {
            case Datatype.NUMBER:
                return !this.isNumber(node.attributes[attr.name]);
            case Datatype.COLOR:
                return !this.isColor(node.attributes[attr.name]);
            default:
                return false;
        }
    }

    /**
     * Check if string is a color
     *
     * @param number The string that shall be checked
     * @return True if a given string is a color
     */
    isNumber(number: string): boolean {
        return !isNaN(parseFloat(number));
    }

    /**
     * Check if string is a color stored as hex value
     *
     * @param color The string that shall be checked
     * @return True if a given string is a color
     */
    isColor(color: string): boolean {
        const testSixDigits = /^#[0-9A-F]{6}$/i.test(color);
        const testThreeDigits = /^#[0-9A-F]{3}$/i.test(color);
        return testSixDigits || testThreeDigits;
    }

    /**
     * Transform attributes of nodes or relations according to the scheme
     *
     * @param scheme Scheme data
     * @param originalAttributes The original attributes of the node or relation
     */
    private transformAttributes(scheme: LabelScheme | RelationType, originalAttributes) {
        const attributes = {};

        // Apply the different schemes for each attribute defined by the label or relation scheme
        scheme.attributes.forEach((attribute) => {
            let nodeAttribute = originalAttributes[attribute.name];

            // Check for mandatory attributes and use default value from the corresponding scheme
            if (attribute.mandatory && !nodeAttribute) nodeAttribute = attribute["defaultValue"];

            // Add parsed and validated attribute to node
            attributes[attribute.name] = Attribute.applyOnElement(attribute, nodeAttribute);
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
        return [result.records[0].get("s").labels[0], result.records[0].get("e").labels[0]];
    }
}
