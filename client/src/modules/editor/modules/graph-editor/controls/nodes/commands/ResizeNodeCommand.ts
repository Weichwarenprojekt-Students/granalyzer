import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";
import { GraphHandler } from "../../GraphHandler";
import { Node, NodeSize } from "@/modules/editor/modules/graph-editor/controls/nodes/Node";
import { dia } from "jointjs";

export class ResizeNodeCommand implements ICommand {
    /**
     * The original size of the element
     */
    private readonly origSize?: NodeSize;

    /**
     * The new size of the element
     */
    private newSize?: NodeSize;

    /**
     * Constructor
     *
     * @param graphHandler Instance of the graph handler
     * @param node The node which is being resized
     * @param direction The direction in which the resizing occurred
     */
    constructor(
        private readonly graphHandler: GraphHandler,
        private readonly node: Node,
        private readonly direction: dia.Direction,
    ) {
        this.origSize = this.graphHandler.graph.sizeOf(node.jointElement);
    }

    /**
     * @return True if the size of the node has changed
     */
    public sizeChanged(): boolean {
        // Set new size of node
        this.newSize = this.graphHandler.graph.sizeOf(this.node.jointElement);

        // Any size couldn't be determined
        if (!this.origSize || !this.newSize) return false;

        return !(this.origSize.width === this.newSize.width && this.origSize.height === this.newSize.height);
    }

    /**
     * Redo the resizing
     */
    redo(): void {
        if (this.newSize) this.node.size = { ...this.newSize, direction: this.direction };
    }

    /**
     * Undo the resizing
     */
    undo(): void {
        if (this.origSize) this.node.size = { ...this.origSize, direction: this.direction };
    }
}
