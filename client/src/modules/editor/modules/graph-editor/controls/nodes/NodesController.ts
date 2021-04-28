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
        // Needs to be done, don't ask why... TODO: Search for some kind of update method
        jointElement.attr("label/textAnchor", "center");
        jointElement.attr("label/textAnchor", "middle");
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

    /**
     * Get the size of a node
     *
     * @param node The node of which to get the size from
     * @return Size of the node or undefined, if size can't be determined
     */
    public sizeOf(node: Node): { width: number; height: number } | undefined {
        // Get size directly from jointJs and if it's set correctly (!= 1) return it
        const jointSize = node.jointElement.size();
        if (jointSize.width !== 1 && jointSize.height !== 1) return jointSize;

        // Otherwise get the dimensions of the rendered element from the DOM
        const domElement = document.querySelector(`.joint-cells-layer > [model-id="${node.jointId}"] > rect`);
        const boundingClientRect = domElement?.getBoundingClientRect();

        // Couldn't get bounding box
        if (boundingClientRect == null) return;

        // Get coordinates of opposite corners on the joint js paper
        const upperLeft = this.graphHandler.graph.paper.clientToLocalPoint(
            boundingClientRect.left,
            boundingClientRect.top,
        );
        const lowerRight = this.graphHandler.graph.paper.clientToLocalPoint(
            boundingClientRect.right,
            boundingClientRect.bottom,
        );

        return {
            width: lowerRight.x - upperLeft.x,
            height: lowerRight.y - upperLeft.y,
        };
    }
}
