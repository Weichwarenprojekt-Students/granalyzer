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

        // Create the shape
        const shape = parseNodeShape(nodeInfo.shape);
        shape.position(nodeInfo.x, nodeInfo.y);

        // Use label color, node color or default color for coloring the node
        const nodeColor = labelColor ?? nodeInfo.color ?? "#70FF87";
        nodeInfo.color = nodeColor;

        // Style node
        shape.attr(Node.nodeStyle(nodeInfo.name, nodeColor));

        // Create new node object and add it to the graph
        const node = new Node(nodeInfo, shape);
        this.addExisting(node);

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
        const jointElement = node.jointElement;
        jointElement.addTo(this.graphHandler.graph.graph);

        // Update some svg attribute, so that style gets shown correctly from the beginning
        // Needs to be done, don't ask why...
        jointElement.attr("body/strokeWidth", 3);
        jointElement.attr("body/strokeWidth", 0);
    }

    /**
     * Remove an existing node object from the graph
     *
     * @param node The node to remove
     */
    public removeExisting(node: Node): void {
        // Remove from node map and joint js graph
        this.remove(node);
        node.jointElement.remove();

        // Remove all relations to and from the node
        for (const rel of node.incomingRelations.values()) this.graphHandler.relations.removeExisting(rel);
        for (const rel of node.outgoingRelations.values()) this.graphHandler.relations.removeExisting(rel);
    }
}
