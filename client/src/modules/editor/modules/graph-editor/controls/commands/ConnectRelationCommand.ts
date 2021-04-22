import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";
import { GraphHandler } from "../GraphHandler";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/models/Relation";
import { Node } from "@/modules/editor/modules/graph-editor/controls/models/Node";

/**
 * Command for connecting a visual relation to different source and target nodes
 */
export class ConnectRelationCommand implements ICommand {
    /**
     * The old source node
     * @private
     */
    private readonly oldSource: Node;

    /**
     * The new source node
     * @private
     */
    private readonly newSource?: Node;

    /**
     * The old target node
     * @private
     */
    private readonly oldTarget: Node;

    /**
     * The new target node
     * @private
     */
    private readonly newTarget?: Node;

    /**
     * Constructor
     *
     * @param graphHandler The current graphHandler
     * @param relation The relation to reconnect
     */
    constructor(private readonly graphHandler: GraphHandler, private readonly relation: Relation) {
        // Save old nodes from the relation object because rel.sourceNode and rel.targetNode haven't been updated yet
        this.oldSource = relation.sourceNode;
        this.oldTarget = relation.targetNode;

        // Save new nodes from the actual source and target of the joint Link
        // They might be undefined if one end isn't connected to any node, but "floats" in the diagram
        this.newSource = this.graphHandler.nodes.getByJointId(relation.jointLink.source()?.id);
        this.newTarget = this.graphHandler.nodes.getByJointId(relation.jointLink.target()?.id);
    }

    /**
     * Check if the connections of the link have changed
     */
    public connectionHasChanged(): boolean {
        // The changed connection should only be recognized if both ends are connected to an actual node
        if (this.newSource == null || this.newTarget == null) return false;

        return !(this.oldSource === this.newSource && this.oldTarget === this.newTarget);
    }

    /**
     * Connect the relation to the new source and target nodes
     */
    redo(): void {
        // Additional check for undefined, so that eslint is happy
        if (!this.connectionHasChanged() || this.newSource == null || this.newTarget == null) return;

        // Connect the actual joint link
        this.relation.jointLink.source(this.newSource.jointElement);
        this.relation.jointLink.target(this.newTarget.jointElement);

        // Update sourceNode and targetNode of the relation, so that all relation references of the nodes are updated
        this.relation.sourceNode = this.newSource;
        this.relation.targetNode = this.newTarget;
    }

    /**
     * Connect the relation to the old source and target nodes
     */
    undo(): void {
        if (!this.connectionHasChanged()) return;

        // Connect the actual joint link
        this.relation.jointLink.source(this.oldSource.jointElement);
        this.relation.jointLink.target(this.oldTarget.jointElement);

        // Update sourceNode and targetNode of the relation, so that all relation references of the nodes are updated
        this.relation.sourceNode = this.oldSource;
        this.relation.targetNode = this.oldTarget;
    }
}
