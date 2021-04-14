import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import { DataSchemeService } from "../data-scheme/data-scheme.service";
import Node from "../nodes/node.model";
import { Attribute } from "../data-scheme/models/attributes";
import Relation from "../relations/relation.model";
import { RelationType } from "../data-scheme/models/relationType";
import { LabelScheme } from "../data-scheme/models/labelScheme";

@Injectable()
export class DataSchemeUtil {
    constructor(private readonly neo4jService: Neo4jService, private readonly dataSchemeService: DataSchemeService) {}

    /**
     * Checks the node if it is valid to the scheme
     * @param node
     */
    async parseRecordByLabel(node: Node) {
        // Gets the label scheme which matches the nodes label name
        const label: LabelScheme = await this.dataSchemeService.getLabelScheme(node.label);
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
        const relationType: RelationType = await this.dataSchemeService.getRelationType(relation.type);

        const [from, to] = await this.getLabelsForRelation(relation);

        // Check if the relation has a valid connection according to the scheme of the relation type
        const hasValidConnection = relationType.connections.some((conn) => conn.from === from && conn.to === to);

        // If not, throw exception
        if (!hasValidConnection) {
            const message = "Relation doesn't have a valid connection";
            throw new InternalServerErrorException(message);
        }

        // Deep copy of attributes
        const relationAttributes = JSON.parse(JSON.stringify(relation.attributes));

        // Parse attributes which are contained in the scheme of the relation type
        relation.attributes = this.transformAttributes(relationType, relationAttributes);

        return relation;
    }

    /**
     * Transform attributes of nodes or relations according to the scheme
     *
     * @param scheme Scheme data
     * @param originalAttributes The original attributes of the node or relation
     * @private
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
     * @private
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
