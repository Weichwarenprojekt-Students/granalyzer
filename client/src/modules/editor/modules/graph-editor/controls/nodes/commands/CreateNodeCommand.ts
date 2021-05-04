import { NodeInfo } from "../models/NodeInfo";
import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { RelationInfo } from "../../relations/models/RelationInfo";
import { Node } from "@/modules/editor/modules/graph-editor/controls/nodes/Node";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/relations/Relation";
import { RelationModeType } from "@/modules/editor/modules/graph-editor/controls/relations/models/RelationModeType";

export class CreateNodeCommand implements ICommand {
    /**
     * The created node
     */
    private node?: Node;

    /**
     * Array of relations that are already existing, needed for a redo
     */
    private existingRelations: Array<Relation> = new Array<Relation>();

    /**
     * Constructor
     *
     * @param graphHandler The graph handler instance
     * @param nodeInfo The node that shall be added
     * @param relations Relations to or from that node
     */
    constructor(private graphHandler: GraphHandler, private nodeInfo: NodeInfo, private relations: RelationInfo[]) {}

    /**
     * The redo action which adds the node to the diagram
     */
    redo(): void {
        // Use existing node after first undo in order to keep the reference
        if (this.node == null) this.node = this.graphHandler.nodes.new(this.nodeInfo);
        else this.graphHandler.nodes.addExisting(this.node);

        if (this.existingRelations.length === 0) {
            // Existing relations are empty on first redo/execution of command
            this.createNewRelations(this.node);
        } else {
            // If relations are already existing, but not displayed in the graph, just add them to the graph again
            this.existingRelations.forEach((relation) => {
                this.graphHandler.relations.addExisting(relation, RelationModeType.NORMAL);
            });
        }

        // Rearrange any straight relations, so that they don't overlap
        this.graphHandler.graph.rearrangeOverlappingRelations(this.node.joint, false);
    }

    /**
     * The undo action which removes the node from the diagram
     */
    undo(): void {
        if (this.node) this.graphHandler.nodes.removeExisting(this.node);
    }

    /**
     * Create new relations when the node is first added to the diagram
     *
     * @param node The node object of the added node
     * @private
     */
    private createNewRelations(node: Node) {
        this.relations.forEach((rel: RelationInfo) => {
            // Discard any relations from the node to itself
            if (rel.from.uuid === rel.to.uuid) return;

            // Array for all nodes with the uuid of the other side of the relation
            let otherNodes: Array<Node>;
            // True if the new node is the target node of the current relation
            let toThisNode = false;

            if (node.reference.uuid === rel.from.uuid) {
                // Get list of target nodes
                otherNodes = [...this.graphHandler.nodes.getByUuid(rel.to.uuid).values()];
            } else if (node.reference.uuid === rel.to.uuid) {
                // Get list of source nodes
                otherNodes = [...this.graphHandler.nodes.getByUuid(rel.from.uuid).values()];
                toThisNode = true;
            } else return;

            for (const otherNode of otherNodes) {
                let sourceNode, targetNode;

                // Assign source and target node according to the direction of the relation
                if (toThisNode) [sourceNode, targetNode] = [otherNode, node];
                else [sourceNode, targetNode] = [node, otherNode];

                // Add new relation to graph
                const newRelation = this.graphHandler.relations.new(rel, sourceNode, targetNode);

                // Add new relation to existingRelations for a future redo
                this.existingRelations.push(newRelation);
            }
        });
    }
}
