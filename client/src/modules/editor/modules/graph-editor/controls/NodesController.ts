import { NodeInfo } from "@/modules/editor/modules/graph-editor/controls/models/NodeInfo";
import { NodeShapes } from "@/modules/editor/modules/graph-editor/controls/models/NodeShapes";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { JointID } from "@/shared/JointGraph";
import { Node } from "@/modules/editor/modules/graph-editor/controls/models/Node";

/**
 * Container for managing nodes and easily accessing them by joint id or backend uuid
 */
class NodesMap implements Iterable<Node> {
    /**
     * Map of joint ids to the corresponding node
     * @private
     */
    private jointIdMap = new Map<JointID, Node>();

    /**
     * Map of the backend uuid to a nested map that maps the index to the corresponding node
     *
     * The second type is another map, because multiple nodes with the same uuid can exist in the graph. The key in
     * the second map, is the index of the corresponding NodeReference object
     * @private
     */
    private backendUuidMap = new Map<string, Map<number, Node>>();

    /**
     * Get node object by joint id
     *
     * @param id The joint id of the element
     */
    public getByJointId(id: JointID | undefined): Node | undefined {
        if (id == null) return undefined;
        return this.jointIdMap.get(id);
    }

    /**
     * Get all nodes for a certain backend uuid, mapped by index of the node
     *
     * @param uuid The backend uuid
     */
    public getByUuid(uuid: string): Map<number, Node> {
        return this.backendUuidMap.get(uuid) ?? new Map<number, Node>();
    }

    /**
     * Get the node for a specific NodeReference, consisting of uuid and index
     *
     * @param uuid The backend uuid
     * @param index The index of the node
     */
    public getByReference(uuid: string, index: number): Node | undefined {
        return this.backendUuidMap.get(uuid)?.get(index);
    }

    /**
     * Iterator for all nodes in the NodesMap object
     */
    public [Symbol.iterator](): Iterator<Node> {
        return this.jointIdMap.values();
    }

    /**
     * Add a node to the node map
     *
     * @param node The node to add
     * @protected
     */
    protected add(node: Node) {
        // If a node with this backend uuid hasn't been added yet, set an empty map for mapping the indices
        if (this.getByUuid(node.reference.uuid).size === 0) {
            this.backendUuidMap.set(node.reference.uuid, new Map<number, Node>());
        }

        // Add the map to both maps
        this.jointIdMap.set(node.jointId, node);
        this.getByUuid(node.reference.uuid).set(node.reference.index, node);
    }

    /**
     * Remove a node from the node map
     *
     * @param node The node to remove
     * @protected
     */
    protected remove(node: Node) {
        this.jointIdMap.delete(node.jointId);
        this.backendUuidMap.get(node.reference.uuid)?.delete(node.reference.index);
    }
}

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
        const shape = NodeShapes.parseType(nodeInfo.shape);
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
