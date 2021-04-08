import { NodeReference } from "@/modules/editor/modules/graph-editor/controls/models/NodeReference";

/**
 * The data for a single relation
 */
export interface Relation {
    /**
     * The reference to the first node
     */
    from: NodeReference;
    /**
     * The reference to the second node
     */
    to: NodeReference;
    /**
     * The uuid for the actual reference (if available)
     */
    uuid?: string;
    /**
     * The type of the relation
     */
    type?: string;
}
