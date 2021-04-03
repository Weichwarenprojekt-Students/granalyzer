import { dia } from "jointjs";
import { Node } from "../../models/Node";
import { ICommand } from "@/modules/editor/modules/graph-editor/UndoRedo/Commands/ICommand";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/GraphHandler";
import { GraphActions } from "../GraphActions";

export class CreateNodeCommand implements ICommand {
    private diagElement = {} as dia.Element;

    constructor(private gH: GraphHandler, private node: Node) {}

    /**
     * The redo action which adds the node to the diagram
     */
    Redo(): void {
        // Make backup of diagram element
        this.diagElement = GraphActions.addNode(this.node, this.gH);
    }

    /**
     * The undo action which removes the node from the diagram
     */
    Undo(): void {
        GraphActions.removeNode(this.diagElement, this.gH);
    }
}
