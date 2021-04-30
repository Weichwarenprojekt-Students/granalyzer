import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { dia, g, shapes } from "jointjs";
import { Node } from "@/modules/editor/modules/graph-editor/controls/nodes/Node";
import { ResizeNodeCommand } from "@/modules/editor/modules/graph-editor/controls/nodes/commands/ResizeNodeCommand";

export class ResizeControls {
    /**
     * Size of a single resizing handle
     */
    private static readonly HANDLE_SIZE = 10;

    /**
     * The currently selected element
     */
    private currentNode: Node | undefined;

    /**
     * The resize handle of the upper left corner
     */
    private readonly upperLeft: dia.Element;

    /**
     * The resize handle of the lower left corner
     */
    private readonly lowerLeft: dia.Element;

    /**
     * The resize handle of the upper right corner
     */
    private readonly upperRight: dia.Element;

    /**
     * The resize handle of the lower right corner
     */
    private readonly lowerRight: dia.Element;

    /**
     * True if resizing of the nodes should be blocked
     */
    private blockResizing = true;

    /**
     * Currently saved resize command
     */
    private resizeCommand?: ResizeNodeCommand;

    /**
     * Constructor
     *
     * @param graphHandler GraphHandler instance
     */
    constructor(private readonly graphHandler: GraphHandler) {
        // Initialize resizing handles with respective css directions for cursor
        this.upperLeft = ResizeControls.generateHandle("nwse");
        this.lowerLeft = ResizeControls.generateHandle("nesw");
        this.upperRight = ResizeControls.generateHandle("nesw");
        this.lowerRight = ResizeControls.generateHandle("nwse");

        // Register events for resizing the nodes on moving a handle
        this.upperLeft.on("change:position", this.generateChangePositionCallback("top-left"));
        this.lowerLeft.on("change:position", this.generateChangePositionCallback("bottom-left"));
        this.upperRight.on("change:position", this.generateChangePositionCallback("top-right"));
        this.lowerRight.on("change:position", this.generateChangePositionCallback("bottom-right"));
    }

    /**
     * Generate resizing handle
     *
     * @param direction The direction in which the resizing cursor should point, used for css class
     */
    private static generateHandle(direction: string): dia.Element {
        // Generate new shape for handle
        const handle = new shapes.standard.Rectangle();
        handle.resize(this.HANDLE_SIZE, this.HANDLE_SIZE);

        // Style the handle
        handle.attr({
            body: {
                fill: "#FFB547",
                strokeWidth: 0,
                class: `resize-handle-${direction}`,
            },
        });

        return handle;
    }

    /**
     * Activate resizing for one node
     *
     * @param elementView The element view of the clicked node
     */
    public activate(elementView: dia.ElementView): void {
        // Deactivate for old node
        this.deactivate();

        // Get node object from graph handler
        const node = this.graphHandler.nodes.getByJointId(elementView.model.id);
        if (!node) return;

        // Set current element and register event for moving handles with the node
        this.currentNode = node;
        this.currentNode.joint.on("change:position change:size", () => {
            this.blockResizing = true;
            this.updateHandles();
            this.blockResizing = false;
        });

        // Set resizing handles to the correct position
        if (!this.updateHandles()) {
            this.deactivate();
            return;
        }

        // Add all handles to the graph
        this.upperLeft.addTo(this.graphHandler.graph.graph);
        this.lowerLeft.addTo(this.graphHandler.graph.graph);
        this.upperRight.addTo(this.graphHandler.graph.graph);
        this.lowerRight.addTo(this.graphHandler.graph.graph);

        this.blockResizing = false;
    }

    /**
     * Deactivate resizing
     */
    public deactivate(): void {
        // Remove event listener from current node
        this.currentNode?.joint.off("change:position change:size", this.updateHandles);
        // Disable resizing
        this.currentNode = undefined;
        this.blockResizing = true;

        // Remove handles from the graph
        this.upperLeft.remove();
        this.lowerLeft.remove();
        this.upperRight.remove();
        this.lowerRight.remove();
    }

    /**
     * Callback for the pointer down event on an element
     *
     * @param elementView The element on which the event occurred
     */
    public pointerDownCallback(elementView: dia.ElementView): void {
        // Get direction of resizing from the clicked handle
        const direction = this.getDirectionOfClickedHandle(elementView.model);

        // If it wasn't a pointerdown event on a handle, or if no node is set, just return
        if (!direction || !this.currentNode) return;

        // Save a new resize command
        this.resizeCommand = new ResizeNodeCommand(this.graphHandler, this.currentNode, direction);
    }

    /**
     * Callback for the pointer up event on an element
     *
     * @param elementView The element on which the event occurred
     */
    public async pointerUpCallback(elementView: dia.ElementView): Promise<void> {
        // If node or resizeCommand are undefined, or if element wasn't a resize handle, just return
        if (!this.currentNode || !this.resizeCommand || !this.getDirectionOfClickedHandle(elementView.model)) return;

        // If the size of the node has changed, dispatch the command
        if (this.resizeCommand.sizeChanged()) await this.graphHandler.dispatchCommand(this.resizeCommand);
    }

    /**
     * Update the position of the resizing handles
     *
     * @return True if successful
     */
    private updateHandles(): boolean {
        // If no node is set, handles can't be updated
        if (!this.currentNode) return false;

        // Get current position and size of the node
        const pos = this.currentNode.joint.position();
        const size = this.graphHandler.graph.sizeOf(this.currentNode.joint);

        // Set the positions of the handles to the four corners of the node, taking offsets into consideration
        this.upperLeft.position(pos.x - ResizeControls.HANDLE_SIZE, pos.y - ResizeControls.HANDLE_SIZE);
        this.lowerLeft.position(pos.x - ResizeControls.HANDLE_SIZE, pos.y + size.height);
        this.upperRight.position(pos.x + size.width, pos.y - ResizeControls.HANDLE_SIZE);
        this.lowerRight.position(pos.x + size.width, pos.y + size.height);

        return true;
    }

    /**
     * Create callback function for the position change of any of the resize handles
     *
     * @param direction The direction in which the handle resizes the node
     * @return The callback function
     */
    private generateChangePositionCallback(direction: dia.Direction): (el: dia.Element, newPos: g.PlainPoint) => void {
        return (el: dia.Element, newPos: g.PlainPoint) => {
            // If resizing is blocked, don't execute this callback
            if (!this.currentNode || this.blockResizing) return;

            // Block resizing
            this.blockResizing = true;

            // Get current position and size of the node
            const pos = this.currentNode.joint.position();
            const size = this.graphHandler.graph.sizeOf(this.currentNode.joint);

            // Calculate width and height according to the direction in which to resize
            const [width, height] =
                direction === "top-left"
                    ? [
                          size.width + (pos.x - newPos.x) - ResizeControls.HANDLE_SIZE,
                          size.height + (pos.y - newPos.y) - ResizeControls.HANDLE_SIZE,
                      ]
                    : direction === "bottom-left"
                    ? [size.width + (pos.x - newPos.x) - ResizeControls.HANDLE_SIZE, newPos.y - pos.y]
                    : direction === "top-right"
                    ? [newPos.x - pos.x, size.height + (pos.y - newPos.y) - ResizeControls.HANDLE_SIZE]
                    : direction === "bottom-right"
                    ? [newPos.x - pos.x, newPos.y - pos.y]
                    : [size.width, size.height];

            // Set new size, but not smaller than minimum size
            this.currentNode.size = {
                width: Math.max(30, width),
                height: Math.max(30, height),
                direction,
            };

            // Update positions of the resize handles
            this.updateHandles();

            // Allow resizing again
            this.blockResizing = false;
        };
    }

    /**
     * Get the correct resizing direction, depending on the resize handle
     *
     * @param element The element of the resize handle
     * @return The direction or undefined if element isn't a resize handle
     */
    private getDirectionOfClickedHandle(element: dia.Element): dia.Direction | undefined {
        switch (element.id) {
            case this.upperLeft.id:
                return "top-left";
            case this.lowerLeft.id:
                return "bottom-left";
            case this.upperRight.id:
                return "top-right";
            case this.lowerRight.id:
                return "bottom-right";
        }
        return undefined;
    }
}
