import { NodeReference } from "@/modules/editor/modules/graph-editor/controls/nodes/models/NodeReference";
import { dia } from "jointjs";
import Anchors from "@/modules/editor/modules/graph-editor/controls/relations/models/Anchors";

/**
 * The data for a single relation
 */
export interface RelationInfo {
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
    uuid: string;
    /**
     * The label text of the relation
     */
    label?: string;
    /**
     * Vertices of the relation
     */
    vertices?: dia.Link.Vertex[];
    /**
     * Anchors of the relation
     */
    anchors?: Anchors;
    /**
     * The z index
     */
    z?: number;
}
