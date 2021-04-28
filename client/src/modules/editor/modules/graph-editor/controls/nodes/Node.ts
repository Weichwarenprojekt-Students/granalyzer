import { NodeReference } from "@/modules/editor/modules/graph-editor/controls/nodes/models/NodeReference";
import { JointID } from "@/shared/JointGraph";
import { deepCopy } from "@/utility";
import { NodeInfo } from "@/modules/editor/modules/graph-editor/controls/nodes/models/NodeInfo";
import { dia } from "jointjs";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/relations/Relation";

export type NodeSize = { width: number; height: number };

/**
 * The data for a single node
 */
export class Node {
    /**
     * The corresponding node info
     */
    public readonly nodeInfo: NodeInfo;

    /**
     * The joint element
     */
    public readonly jointElement: dia.Element;

    /**
     * All incoming relations, managed by the corresponding relation objects themselves
     */
    public readonly incomingRelations = new Map<JointID, Relation>();

    /**
     * All outgoing relations, managed by the corresponding relation objects themselves
     */
    public readonly outgoingRelations = new Map<JointID, Relation>();

    /**
     * Constructor
     *
     * @param nodeInfo NodeInfo object
     * @param jointElement A joint element
     */
    constructor(nodeInfo: NodeInfo, jointElement: dia.Element) {
        this.nodeInfo = nodeInfo;
        this.jointElement = jointElement;
    }

    /**
     * The reference of the node containing uuid and index
     */
    public get reference(): NodeReference {
        return deepCopy(this.nodeInfo.ref);
    }

    /**
     * The joint js uuid
     */
    public get jointId(): JointID {
        return this.jointElement.id;
    }

    /**
     * The size of the element
     *
     * @param width The new width
     * @param height The new height
     * @param direction The direction in which to resize the element
     */
    public set size({ width, height, direction }: { width: number; height: number; direction?: dia.Direction }) {
        if (this.jointElement.attr("body/ref")) {
            // Remove all attributes for relative sizing if they are still set
            this.jointElement.removeAttr("body/ref");
            this.jointElement.removeAttr("body/refWidth2");
            this.jointElement.removeAttr("body/refHeight2");
        }

        // Resize element and persist new size
        this.jointElement.resize(width, height, { direction });
        this.nodeInfo.size = { width, height };
    }
}
