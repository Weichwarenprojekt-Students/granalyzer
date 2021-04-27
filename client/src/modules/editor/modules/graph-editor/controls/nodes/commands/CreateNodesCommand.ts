import { NodeInfo } from "../models/NodeInfo";
import { ICommand } from "@/modules/editor/modules/graph-editor/controls/models/ICommand";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { RelationInfo } from "../../relations/models/RelationInfo";
import { Node } from "@/modules/editor/modules/graph-editor/controls/nodes/Node";
import { RelationModeType } from "@/modules/editor/modules/graph-editor/controls/relations/models/RelationModeType";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/relations/Relation";

export class CreateNodesCommand implements ICommand {
    /**
     * The created nodes
     */
    private graphNodes: Node[] = [];

    /**
     * Constructor
     *
     * @param graphHandler The graph handler instance
     * @param nodes The nodes that shall be added
     * @param relations Relations to or from added nodes
     * @param labelColors Colors of the labels of the nodes
     */
    constructor(
        private graphHandler: GraphHandler,
        private nodes: NodeInfo[],
        private relations: RelationInfo[][],
        private labelColors: string[],
    ) {}

    redo(): void {
        // Add nodes first time
        if (this.graphNodes.length == 0) {
            for (let i = 0; i < this.nodes.length; i++) {
                const graphNode: Node = this.graphHandler.nodes.new(this.nodes[i], this.labelColors[i]);
                this.graphNodes.push(graphNode);
            }
        } else {
            // Nodes already exist
            for (const graphNode of this.graphNodes) {
                this.graphHandler.nodes.addExisting(graphNode);
            }
        }

        for (let i = 0; i < this.graphNodes.length; i++) {
            // Add new relations of this node
            this.createRelations(this.graphNodes[i], this.relations[i]);
        }
    }

    undo(): void {
        if (this.graphNodes) {
            for (const node of this.graphNodes) {
                this.graphHandler.nodes.removeExisting(node);
            }
        }
    }

    private createRelations(node: Node, relations: RelationInfo[]) {
        relations.forEach((rel: RelationInfo) => {

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
                this.graphHandler.relations.new(
                    sourceNode,
                    targetNode,
                    RelationModeType.NORMAL,
                    rel.label,
                    rel.uuid,
                );
            }
        });
    }
}
