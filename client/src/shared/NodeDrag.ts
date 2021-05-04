export interface NodeDrag {
    /**
     * The actual drag event
     */
    evt: DragEvent;

    /**
     * Name of the node
     */
    name: string;

    /**
     * Color of the node
     */
    color?: string;

    /**
     * Border color of the node
     */
    borderColor?: string;

    /**
     * The color of the node label
     */
    labelColor?: string;

    /**
     * Shape of the node
     */
    shape: string;

    /**
     * The uuid
     */
    nodeId: string;

    /**
     * The corresponding label
     */
    label: string;
}
