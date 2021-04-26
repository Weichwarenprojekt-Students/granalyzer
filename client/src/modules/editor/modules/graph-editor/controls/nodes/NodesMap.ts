import { Node } from "@/modules/editor/modules/graph-editor/controls/nodes/Node";
import { JointID } from "@/shared/JointGraph";

/**
 * Container for managing nodes and easily accessing them by joint id or backend uuid
 */
export class NodesMap implements Iterable<Node> {
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
    protected add(node: Node): void {
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
    protected remove(node: Node): void {
        this.jointIdMap.delete(node.jointId);
        this.backendUuidMap.get(node.reference.uuid)?.delete(node.reference.index);
    }
}
