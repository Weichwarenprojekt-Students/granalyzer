import { dia } from "jointjs";
import { Node } from "../../models/Node";
import { ICommand } from "@/modules/editor/modules/graph-editor/undo-redo/commands/ICommand";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/GraphHandler";
import { GraphActions } from "../GraphActions";

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
     */
    constructor(private graphHandler: GraphHandler, private node: Node) {}

    /**
     * The redo action which adds the node to the diagram
     */
    redo(): void {
        this.diagElement = GraphActions.addNode(this.node, this.graphHandler);
    }

    /**
     * The undo action which removes the node from the diagram
     */
    undo(): void {
        if (this.diagElement) GraphActions.removeNode(this.diagElement, this.graphHandler);
    }
}
