import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import { Label } from "../data-scheme/models/label";
import { DataSchemeService } from "../data-scheme/data-scheme.service";
import Node from "../nodes/node.model";
import { Attribute } from "../data-scheme/models/attributes";
import MandatoryAttributeMissingException from "./exceptions/MandatoryAttributeMissing.exception";

@Injectable()
export class DataSchemeUtil {
    constructor(private readonly neo4jService: Neo4jService, private readonly dataSchemeService: DataSchemeService) {}

    /**
     * Checks the node if it is valid to the scheme
     * @param node
     */
    async parseRecordByLabel(node: Node) {
        // Gets the label scheme which matches the nodes label name
        const label: Label = await this.dataSchemeService.getLabelByName(node.label);
        // Deep copy all attributes from the node
        const nodeAttributes = JSON.parse(JSON.stringify(node.attributes));
        // Deletes the node Attributes
        node.attributes = {};

        try {
            // Apply the different schemes for each attribute defined by the label scheme
            label.attributes.forEach((attribute) => {
                const nodeAttribute = nodeAttributes[attribute.name];

                // Check for mandatory attributes
                if (attribute.mandatory && !nodeAttribute) {
                    throw new MandatoryAttributeMissingException("Mandatory attribute is missing on requested node");
                } else if (nodeAttributes[attribute.name]) {
                    // Add parsed and validated attribute to node
                    node.attributes[attribute.name] = Attribute.applyOnElement(attribute, nodeAttribute);
                }
            });
        } catch (e) {
            // Catch the Error if a Mandatory field is Empty
            if (e instanceof MandatoryAttributeMissingException) {
                console.error(e.message);
                throw new InternalServerErrorException("Mandatory attribute is missing");
            }
            throw e;
        }
        return node;
    }
}
