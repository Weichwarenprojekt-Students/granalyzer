import { dia } from "jointjs";
import { Node } from "../models/Node";
import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { Relation } from "../models/Relation";

export class CreateNodeCommand implements ICommand {
    /**
     * The created node
     */
    private diagElement?: dia.Element;

    /**
     * Array of relations that are already existing, needed for a redo
     */
    private existingRelations: Array<[Relation, dia.Element]> = [];

    /**
     * Constructor
     *
     * @param graphHandler The graph handler instance
     * @param node The node that shall be added
     * @param relations Relations to or from that node
     */
    constructor(private graphHandler: GraphHandler, private node: Node, private relations: Relation[]) {}

    /**
     * The redo action which adds the node to the diagram
     */
    redo(): void {
        // Use existing node after first undo in order to keep the reference
        if (!this.diagElement) this.diagElement = this.graphHandler.controls.addNode(this.node);
        else this.graphHandler.controls.addExistingNode(this.node, this.diagElement);

        if (this.existingRelations.length === 0) {
            this.relations.forEach((rel: Relation) => {
                // TODO: simplify code
                if (rel.from.uuid === this.node.ref.uuid) {
                    // If the new node is the start point of the relation
                    this.graphHandler.nodes.forEach((node, id) => {
                        // Connect relation to all end nodes that are in the diagram
                        if (rel.to.uuid == node.ref.uuid && this.diagElement) {
                            const relId = this.graphHandler.controls.addRelation(
                                this.diagElement,
                                this.graphHandler.getCellById(id),
                                rel.uuid,
                                rel.type,
                            );

                            // Register the created relation for a future redo
                            let newRelationObject;
                            if (relId !== undefined && (newRelationObject = this.graphHandler.relations.get(relId)))
                                this.existingRelations.push([newRelationObject, this.graphHandler.getCellById(relId)]);
                        }
                    });
                } else if (rel.to.uuid === this.node.ref.uuid) {
                    // Else if the new node is the endpoint of the relation
                    this.graphHandler.nodes.forEach((node, id) => {
                        // Connect relation to all start nodes that are in the diagram
                        if (rel.from.uuid == node.ref.uuid && this.diagElement) {
                            const relId = this.graphHandler.controls.addRelation(
                                this.graphHandler.getCellById(id),
                                this.diagElement,
                                rel.uuid,
                                rel.type,
                            );

                            // Register the created relation for a future redo
                            let newRelationObject;
                            if (relId !== undefined && (newRelationObject = this.graphHandler.relations.get(relId)))
                                this.existingRelations.push([newRelationObject, this.graphHandler.getCellById(relId)]);
                        }
                    });
                }
            });
        } else {
            // If relations are already existing, but not displayed in the graph, just add them to the graph again
            this.existingRelations.forEach(([relation, link]) => {
                this.graphHandler.controls.addExistingRelation(link, relation);
            });
        }
    }

    /**
     * The undo action which removes the node from the diagram
     */
    undo(): void {
        if (this.diagElement) this.graphHandler.controls.removeNode(this.diagElement);
    }
}
