import { Node } from "@/modules/editor/modules/graph-editor/controls/nodes/Node";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";

export class ShapeNodeCommand implements ICommand {
    /**
     * The old shape of the node
     */
    private readonly oldShape: string;

    /**
     * Constructor
     *
     * @param graphHandler The graph handler
     * @param node The node reference
     * @param newShape The new desired shape
     */
    constructor(
        private readonly graphHandler: GraphHandler,
        private readonly node: Node,
        private readonly newShape: string,
    ) {
        this.oldShape = this.node.info.shape;
    }

    /**
     * Set the new shape
     */
    async redo(): Promise<void> {
        await this.graphHandler.nodes.setShape(this.node, this.newShape);
    }

    /**
     * Set the old shape
     */
    async undo(): Promise<void> {
        await this.graphHandler.nodes.setShape(this.node, this.oldShape);
    }
}
