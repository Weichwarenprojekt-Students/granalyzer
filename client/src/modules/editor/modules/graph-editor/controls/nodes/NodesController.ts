import { NodeInfo } from "@/modules/editor/modules/graph-editor/controls/nodes/models/NodeInfo";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { Node } from "@/modules/editor/modules/graph-editor/controls/nodes/Node";
import { NodesMap } from "@/modules/editor/modules/graph-editor/controls/nodes/NodesMap";
import { parseNodeShape } from "@/shared/NodeShapes";

/**
 * Controller for all nodes in the joint js graph
 */
export default class NodesController extends NodesMap {
    /**
     * Constructor
     *
     * @param graphHandler Instance of the graph handler
     */
    constructor(private readonly graphHandler: GraphHandler) {
        super();
    }

    /**
     * Create a new node and add it to the graph
     *
     * @param nodeInfo The node info from which to create the new node
     * @param labelColor Color of the label of the node
     */
    public new(nodeInfo: NodeInfo, labelColor?: string): Node {
        // Get all nodes with the Uuid from the graph
        const existingNodesWithUuid = this.getByUuid(nodeInfo.ref.uuid);

        // Set the next index to the max existing index + 1
        nodeInfo.ref.index = Math.max(-1, ...existingNodesWithUuid.keys()) + 1;

        // Create the node
        nodeInfo.color = labelColor ?? nodeInfo.color ?? "#70FF87";
        const shape = parseNodeShape(nodeInfo);
        shape.position(nodeInfo.x, nodeInfo.y);

        // Create new node object
        const node = new Node(nodeInfo, shape);

        // Add it to the graph
        this.addExisting(node);

        // Set z index
        if (nodeInfo.z != null) node.joint.set("z", nodeInfo.z);

        return node;
    }

    /**
     * Add an existing node object to the graph
     *
     * @param node The node to add
     */
    public addExisting(node: Node): void {
        // Add node to NodesMap and to the joint js graph
        this.add(node);
        const jointElement = node.joint;
        jointElement.addTo(this.graphHandler.graph.graph);

        // Directly set the size to an absolute value
        node.size = node.info.size ?? this.graphHandler.graph.sizeOf(node.joint);
    }

    /**
     * Remove an existing node object from the graph
     *
     * @param node The node to remove
     */
    public removeExisting(node: Node): void {
        // Remove from node map and joint js graph
        this.remove(node);
        node.joint.remove();

        // Remove all relations to and from the node
        for (const rel of node.incomingRelations.values()) this.graphHandler.relations.removeExisting(rel);
        for (const rel of node.outgoingRelations.values()) this.graphHandler.relations.removeExisting(rel);
    }

    /**
     * Update the joint element of a node
     */
    public async setShape(node: Node, shape: string): Promise<void> {
        await this.graphHandler.controls.resizeControls.deactivate();
        // Create the new joint element
        node.info.shape = shape;
        const newNode = parseNodeShape(node.info);

        // Add the element and update the node reference
        newNode.addTo(this.graphHandler.graph.graph);
        this.remove(node);
        node.joint = newNode;
        this.add(node);

        // Select the item
        await this.graphHandler.controls.selectNode(this.graphHandler.graph.paper.findViewByModel(newNode));
    }
}
