import { NodeShapes } from "@/shared/NodeShapes";

export class NodeDrag {
    /**
     * The data for a node drag event
     *
     * @param evt The actual drag event
     * @param name Name of the node
     * @param color Color of the node
     * @param shape Shape of the node
     * @param nodeId The uuid
     * @param label The corresponding label
     */
    constructor(
        public evt: DragEvent,
        public name = "",
        public color = "#333",
        public shape = NodeShapes.RECTANGLE,
        public nodeId: string = "",
        public label: string = "",
    ) {}
}
