import { dia } from "jointjs";
import { RelationInfo } from "@/modules/editor/modules/graph-editor/controls/relations/models/RelationInfo";
import { JointID } from "@/shared/JointGraph";
import { Node } from "@/modules/editor/modules/graph-editor/controls/nodes/Node";
import { RelationModeType } from "@/modules/editor/modules/graph-editor/controls/relations/models/RelationModeType";
import Anchors from "@/modules/editor/modules/graph-editor/controls/relations/models/Anchors";

/**
 * The data for a single relation
 */
export class Relation {
    /**
     * Color for normal relations
     */
    public static readonly NORMAL_RELATION_COLOR = "#333";

    /**
     * Color for visual relations
     */
    public static readonly VISUAL_RELATION_COLOR = "#3765c7";

    /**
     * Color for faint DB relations
     */
    public static readonly FAINT_RELATION_COLOR = "#bbb";

    /**
     * The corresponding relation info
     */
    public readonly info: RelationInfo;

    /**
     * The joint link
     */
    public readonly joint: dia.Link;

    /**
     * Constructor
     *
     * @param relation Instance of a relation info
     * @param jointLink A joint js link
     * @param sourceNode Source node of the relation
     * @param targetNode Target node of the relation
     * @param relationModeType The relation mode type of the relation, defaults to NORMAL
     */
    constructor(
        relation: RelationInfo,
        jointLink: dia.Link,
        sourceNode: Node,
        targetNode: Node,
        relationModeType = RelationModeType.NORMAL,
    ) {
        this.info = relation;
        this.joint = jointLink;
        this.sourceNode = sourceNode;
        this.targetNode = targetNode;
        this.relationModeType = relationModeType;
    }

    /**
     * True if the object is a node
     */
    public isNode(): this is Node {
        return false;
    }

    /**
     * True if the object is a relation
     */
    public isRelation(): this is Relation {
        return true;
    }

    /**
     * The relation mode type of the relation
     * @private
     */
    private _relationModeType: RelationModeType = RelationModeType.NORMAL;

    /**
     * The relation mode type of the relation
     */
    public get relationModeType(): RelationModeType {
        return this._relationModeType;
    }

    /**
     * Set the relation mode type of the relation to a new value and change style according to new type
     *
     * @param value The new relation mode type
     */
    public set relationModeType(value: RelationModeType) {
        this._relationModeType = value;

        // Change style of the link
        this.joint.attr({ line: { stroke: Relation.getColorForRelationModeType(value) } });

        // Change style of the label separately
        this.joint.label(0, { attrs: { rect: { fill: Relation.getColorForRelationModeType(value) } } });
    }

    /**
     * Reference to the source node
     * @private
     */
    private _sourceNode?: Node;

    /**
     * Reference to the source node
     */
    public get sourceNode(): Node {
        // Return value is never undefined because it's actually set in the constructor but eslint doesn't recognize it
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this._sourceNode!;
    }

    /**
     * Set the source node to a new node
     *
     * @param newNode The new node
     */
    public set sourceNode(newNode: Node) {
        if (this._sourceNode != null)
            // If source node is already set, deregister the relation from the old node
            this._sourceNode.outgoingRelations.delete(this.jointId);

        this._sourceNode = newNode;
        this.joint.source(newNode.joint);

        this.info.from = newNode.reference;

        // Register the relation on the new node
        this._sourceNode.outgoingRelations.set(this.jointId, this);
    }

    /**
     * Reference to the target node
     * @private
     */
    private _targetNode?: Node;

    /**
     * Reference to the target node
     */
    public get targetNode(): Node {
        // Return value is never undefined because it's actually set in the constructor but eslint doesn't recognize it
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this._targetNode!;
    }

    /**
     * Set the target node to a new node
     *
     * @param newNode The new node
     */
    public set targetNode(newNode: Node) {
        if (this._targetNode != null)
            // If target node is already set, deregister the relation from the old node
            this._targetNode.incomingRelations.delete(this.jointId);

        this._targetNode = newNode;
        this.joint.target(newNode.joint);

        this.info.to = newNode.reference;

        // Register the relation on the new node
        this._targetNode.incomingRelations.set(this.jointId, this);
    }

    /**
     * The backend uuid of the relation
     */
    public get uuid(): string {
        return this.info.uuid;
    }

    /**
     * The joint js uuid
     */
    public get jointId(): JointID {
        return this.joint.id;
    }

    /**
     * Vertices of the joint js link
     */
    public get vertices(): Array<dia.Link.Vertex> {
        return this.joint.vertices();
    }

    /**
     * Set the vertices of the joint js link and of the relation info
     *
     * @param vertices The new vertices
     */
    public set vertices(vertices: Array<dia.Link.Vertex>) {
        // Update relation info as well
        this.info.vertices = vertices;
        this.joint.vertices(vertices);
    }

    /**
     * Anchors of the joint link
     */
    public get anchors(): Anchors {
        return { sourceAnchor: this.joint.source().anchor, targetAnchor: this.joint.target().anchor };
    }

    /**
     * Set anchors of the joint link
     *
     * @param anchors The new anchors of the link
     */
    public set anchors(anchors: Anchors) {
        const { sourceAnchor, targetAnchor } = anchors;

        // Set new anchors, if any are undefined, just set the center anchor
        this.joint.source({ ...this.joint.source(), anchor: sourceAnchor ?? { name: "center" } });
        this.joint.target({ ...this.joint.target(), anchor: targetAnchor ?? { name: "center" } });
    }

    /**
     * Get color of relations for the corresponding relation mode type
     *
     * @param relationModeType The desired relation mode type
     * @return Color for the desired relation type mode
     */
    public static getColorForRelationModeType(relationModeType: RelationModeType): string {
        switch (relationModeType) {
            case RelationModeType.VISUAL:
                return this.VISUAL_RELATION_COLOR;
            case RelationModeType.FAINT:
                return this.FAINT_RELATION_COLOR;
            case RelationModeType.NORMAL:
            default:
                return this.NORMAL_RELATION_COLOR;
        }
    }

    /**
     * Generate label for a relation
     *
     * @param labelText The text of the label
     * @param relationModeType The relation type mode of the relation
     * @return Label for adding to the joint js link
     */
    public static makeLabel(labelText: string, relationModeType = RelationModeType.NORMAL): dia.Link.Label {
        return {
            attrs: {
                text: { text: labelText, textAnchor: "middle", textVerticalAnchor: "middle", fill: "#fff" },
                rect: {
                    ref: "text",
                    fill: this.getColorForRelationModeType(relationModeType),
                    stroke: "#000",
                    strokeWidth: 0,
                    refWidth: 12,
                    refHeight: 2,
                    refX: -6,
                    refY: -1,
                    rx: 0,
                    ry: 0,
                },
            },
        };
    }

    /**
     * Register the relation on the source and target nodes
     */
    public reconnect(): void {
        this.sourceNode.outgoingRelations.set(this.jointId, this);
        this.targetNode.incomingRelations.set(this.jointId, this);
    }

    /**
     * Delete registration of relation from source and target nodes
     */
    public disconnect(): void {
        this.sourceNode.outgoingRelations.delete(this.jointId);
        this.targetNode.incomingRelations.delete(this.jointId);
    }
}
