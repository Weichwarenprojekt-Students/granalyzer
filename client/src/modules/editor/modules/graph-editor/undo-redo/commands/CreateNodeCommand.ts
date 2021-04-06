import { dia } from "jointjs";
import { Node } from "../models/Node";
import { ICommand } from "@/modules/editor/modules/graph-editor/undo-redo/commands/ICommand";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/undo-redo/GraphHandler";
import { GraphActions } from "../GraphActions";
import { Relation } from "../models/Relation";

export class CreateNodeCommand implements ICommand {
    /**
     * The created node
     */
    private diagElement?: dia.Element;

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
        this.diagElement = GraphActions.addNode(this.node, this.graphHandler);

        this.relations.forEach((rel: Relation) => {
            if (rel.from.uuid === this.node.ref.uuid) {
                // If the new node is the start point of the relation
                this.graphHandler.nodes.forEach((value: Node, key: dia.Element) => {
                    // Connect relation to all end nodes that are in the diagram
                    if (rel.to.uuid == value.ref.uuid && this.diagElement)
                        GraphActions.addRelation(this.graphHandler, this.diagElement, key, rel.uuid, rel.type);
                });
            } else if (rel.to.uuid === this.node.ref.uuid) {
                // Else if the new node is the endpoint of the relation
                this.graphHandler.nodes.forEach((value: Node, key: dia.Element) => {
                    // Connect relation to all start nodes that are in the diagram
                    if (rel.from.uuid == value.ref.uuid && this.diagElement)
                        GraphActions.addRelation(this.graphHandler, key, this.diagElement, rel.uuid, rel.type);
                });
            }
        });
    }

    /**
     * The undo action which removes the node from the diagram
     */
    undo(): void {
        if (this.diagElement) GraphActions.removeNode(this.diagElement, this.graphHandler);
    }
}
