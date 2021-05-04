import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";
import { GraphHandler } from "../../GraphHandler";
import { g } from "jointjs";
import { Node } from "@/modules/editor/modules/graph-editor/controls/nodes/Node";

export class MoveNodeCommand implements ICommand {
    /**
     * The initial position
     */
    private readonly startPos: g.PlainPoint;

    /**
     * The final position
     */
    private stopPos?: g.PlainPoint;

    /**
     * Constructor
     *
     * @param graphHandler The graph handler instance
     * @param node The node that was moved
     */
    constructor(private graphHandler: GraphHandler, private node: Node) {
        this.startPos = node.position;
    }

    /**
     * Check if the node actually changed its position
     */
    public positionChanged(): boolean {
        this.stopPos = this.node.position;
        return !(this.startPos.x === this.stopPos.x && this.startPos.y === this.stopPos.y);
    }

    /**
     * Move the node to the new position
     */
    redo(): void {
        if (this.node && this.stopPos != null) this.node.position = this.stopPos;
    }

    /**
     * Move the node to the old position
     */
    undo(): void {
        if (this.node) this.node.position = this.startPos;
    }
}
