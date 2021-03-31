import { NodeReference } from "@/modules/editor/modules/graph-editor/models/NodeReference";

/**
 * The data for a single node
 */
export interface Node {
    /**
     * The x position
     */
    x: number;
    /**
     * The y position
     */
    y: number;
    /**
     * The node reference
     */
    ref: NodeReference;
    /**
     * The label of the node
     */
    label: string;
    /**
     * The type
     */
    shape: string;
    /**
     * The color value
     */
    color: string;
}
