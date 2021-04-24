import { Relation } from "@/modules/editor/modules/graph-editor/controls/relations/Relation";
import { JointID } from "@/shared/JointGraph";

/**
 * Container for managing relations and easily accessing them by joint id or backend uuid
 */
export class RelationsMap implements Iterable<Relation> {
    /**
     * Map of joint ids to the corresponding relation
     * @private
     */
    private jointIdMap = new Map<JointID, Relation>();

    /**
     * Map of backend uuid to an array of corresponding relations
     *
     * The second type is an array, because multiple relations with the same backend uuid can exist in the graph
     * @private
     */
    private backendUuidMap = new Map<string, Array<Relation>>();

    /**
     * Get relation object by joint id
     *
     * @param id The joint id of the link
     */
    public getByJointId(id: JointID): Relation | undefined {
        return this.jointIdMap.get(id);
    }

    /**
     * Get all relations for a certain backend uuid
     *
     * @param uuid The backend uuid
     */
    public getByUuid(uuid: string): Array<Relation> {
        return this.backendUuidMap.get(uuid) ?? new Array<Relation>();
    }

    /**
     * Iterator for all nodes in the RelationsMap object
     */
    public [Symbol.iterator](): IterableIterator<Relation> {
        return this.jointIdMap.values();
    }

    /**
     * Add a relation to the relation map
     *
     * @param relation The relation to add
     * @protected
     */
    protected add(relation: Relation): void {
        // If a relation with this backend uuid hasn't been added yet, set an empty array for all relations of that uuid
        if (this.getByUuid(relation.uuid).length === 0) {
            this.backendUuidMap.set(relation.uuid, new Array<Relation>());
        }

        // Add the relation to both maps
        this.jointIdMap.set(relation.jointId, relation);
        this.backendUuidMap.get(relation.uuid)?.push(relation);
    }

    /**
     * Remove a relation from the relation map
     *
     * @param relation The relation to remove
     * @protected
     */
    protected remove(relation: Relation): void {
        this.jointIdMap.delete(relation.jointId);

        const relationsWithUuid = this.backendUuidMap.get(relation.uuid);
        if (relationsWithUuid == null) return;

        // Remove this one relation object from the array of all relations with the same uuid
        const index = relationsWithUuid.indexOf(relation);
        if (index > -1) relationsWithUuid.splice(index, 1);
    }
}
