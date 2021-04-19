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
    private existingRelations: Array<[Relation, dia.Link]> = new Array<[Relation, dia.Link]>();

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
                // Continue, if this.node is not part of the relation
                if (rel.from.uuid !== this.node.ref.uuid && rel.to.uuid !== this.node.ref.uuid) return;

                this.graphHandler.nodes.forEach((otherNode, id) => {
                    // Continue if otherNode is not part of relation, or this.diagElement is undefined
                    if (
                        (rel.to.uuid !== otherNode.ref.uuid && rel.from.uuid !== otherNode.ref.uuid) ||
                        this.node.ref.uuid === otherNode.ref.uuid ||
                        !this.diagElement
                    )
                        return;

                    // Set from and to element
                    let from = this.diagElement;
                    let to = this.graphHandler.getCellById(id);
                    if (!to) return;

                    // Switch them, if this.node is the end node
                    if (rel.to.uuid === this.node.ref.uuid) {
                        [to, from] = [from, to];
                    }

                    // Add relation to graph and get id of the relation
                    const relId = this.graphHandler.controls.addRelation(from, to, rel.uuid, rel.type);

                    // Register the created relation for a future redo
                    let newRelationObject;
                    if (relId !== undefined && (newRelationObject = this.graphHandler.relations.get(relId)))
                        this.existingRelations.push([newRelationObject, this.graphHandler.getLinkById(relId)]);
                });
            });
        } else {
            // If relations are already existing, but not displayed in the graph, just add them to the graph again
            this.existingRelations.forEach(([relation, link]) => {
                this.graphHandler.controls.addExistingRelation(link, relation);
            });
        }

        this.graphHandler.graph.rearrangeOverlappingRelations(this.diagElement);
    }

    /**
     * The undo action which removes the node from the diagram
     */
    undo(): void {
        if (this.diagElement) this.graphHandler.controls.removeNode(this.diagElement);
    }
}
