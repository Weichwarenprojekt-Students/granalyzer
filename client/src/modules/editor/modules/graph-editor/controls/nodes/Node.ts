import { NodeReference } from "@/modules/editor/modules/graph-editor/controls/nodes/models/NodeReference";
import { JointID } from "@/shared/JointGraph";
import { deepCopy } from "@/utility";
import { NodeInfo } from "@/modules/editor/modules/graph-editor/controls/nodes/models/NodeInfo";
import { dia, g } from "jointjs";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/relations/Relation";

export type NodeSize = { width: number; height: number };

/**
 * The data for a single node
 */
export class Node {
    /**
     * The corresponding node info
     */
    public readonly info: NodeInfo;

    /**
     * The joint element
     */
    private _joint: dia.Element;

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
        this.info = nodeInfo;
        this._joint = jointElement;
    }

    /**
     * True if the object is a node
     */
    public isNode(): this is Node {
        return true;
    }

    /**
     * True if the object is a relation
     */
    public isRelation(): this is Relation {
        return false;
    }

    /**
     * The reference of the node containing uuid and index
     */
    public get reference(): NodeReference {
        return deepCopy(this.info.ref);
    }

    /**
     * The joint js uuid
     */
    public get jointId(): JointID {
        return this.joint.id;
    }

    /**
     * The joint element
     */
    public get joint(): dia.Element {
        return this._joint;
    }

    /**
     * Set the joint element of a node
     *
     * @param newElement The new joint element
     */
    public set joint(newElement: dia.Element) {
        // Set the bounds
        newElement.position(this.position.x, this.position.y);

        // Update the joint element and safe the old reference
        const oldElement = this._joint;
        this._joint = newElement;
        this.size = this.info.size;

        // Update the relations
        for (const rel of [...this.incomingRelations.values()]) rel.targetNode = this;
        for (const rel of [...this.outgoingRelations.values()]) rel.sourceNode = this;

        // Delete the old node
        oldElement.remove();
    }

    /**
     * The size of the element
     *
     * @param width The new width
     * @param height The new height
     * @param direction The direction in which to resize the element
     */
    public set size({ width, height, direction }: { width: number; height: number; direction?: dia.Direction }) {
        if (this.joint.attr("body/ref")) {
            // Remove all attributes for relative sizing if they are still set
            this.joint.removeAttr("body/ref");
            this.joint.removeAttr("body/refWidth2");
            this.joint.removeAttr("body/refHeight2");
        }

        // Resize element and persist new size
        this.joint.resize(width, height, { direction });
        this.info.size = { width, height };
    }

    /**
     * Position of the node
     */
    public get position(): g.PlainPoint {
        return this.joint.position();
    }

    /**
     * Set position of the node
     */
    public set position({ x, y }: g.PlainPoint) {
        this.joint.position(x, y);
        this.info.x = x;
        this.info.y = y;
    }
}
