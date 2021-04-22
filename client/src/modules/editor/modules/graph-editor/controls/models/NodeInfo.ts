import { NodeReference } from "@/modules/editor/modules/graph-editor/controls/models/NodeReference";

/**
 * The data for a single node
 */
export interface NodeInfo {
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
     * The name of the node
     */
    name: string;
    /**
     * The type
     */
    shape: string;
    /**
     * The color value
     */
    color: string;
}
