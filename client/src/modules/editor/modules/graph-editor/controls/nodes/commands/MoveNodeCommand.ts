import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";
import { GraphHandler } from "../../GraphHandler";
import { g } from "jointjs";
import { Node } from "@/modules/editor/modules/graph-editor/controls/nodes/Node";

export class MoveNodeCommand implements ICommand {
    /**
     * The initial position
     */
    private readonly startPos: g.Point;

    /**
     * The final position
     */
    private stopPos?: g.Point;

    /**
     * Constructor
     *
     * @param graphHandler The graph handler instance
     * @param node The node that was moved
     */
    constructor(private graphHandler: GraphHandler, private node: Node) {
        this.startPos = node.jointElement.position();
    }

    /**
     * Check if the node actually changed its position
     */
    public positionChanged(): boolean {
        this.stopPos = this.node.jointElement.position();
        return !this.startPos.equals(this.stopPos);
    }

    /**
     * Move the node to the new position
     */
    redo(): void {
        if (this.node && this.stopPos != null) this.node.jointElement.position(this.stopPos.x, this.stopPos.y);
    }

    /**
     * Move the node to the old position
     */
    undo(): void {
        if (this.node) {
            this.node.jointElement.position(this.startPos.x, this.startPos.y);
        }
    }
}
