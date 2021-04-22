import { RelationInfo } from "@/modules/editor/modules/graph-editor/controls/models/RelationInfo";
import { dia, linkTools, shapes } from "jointjs";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { JointID } from "@/shared/JointGraph";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/models/Relation";
import { Node } from "@/modules/editor/modules/graph-editor/controls/models/Node";
import { RootState } from "@/store";
import { Store } from "vuex";
import { RemoveRelationCommand } from "@/modules/editor/modules/graph-editor/controls/commands/RemoveRelationCommand";
import { RelationModeType } from "@/modules/editor/modules/graph-editor/controls/models/RelationModeType";

/**
 * Container for managing relations and easily accessing them by joint id or backend uuid
 */
class RelationsMap implements Iterable<Relation> {
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
    protected add(relation: Relation) {
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
    protected remove(relation: Relation) {
        this.jointIdMap.delete(relation.jointId);

        const relationsWithUuid = this.backendUuidMap.get(relation.uuid);
        if (relationsWithUuid == null) return;

        // Remove this one relation object from the array of all relations with the same uuid
        const index = relationsWithUuid.indexOf(relation);
        if (index > -1) relationsWithUuid.splice(index, 1);
    }
}

/**
 * Controller for all relations in the joint js graph
 */
export default class RelationsController extends RelationsMap {
    /**
     * Constructor
     *
     * @param graphHandler Instance of the graph handler
     * @param store
     */
    constructor(private readonly graphHandler: GraphHandler, private store: Store<RootState>) {
        super();
    }

    /**
     * Generator which iterates over normal relations
     */
    public *normalRelations(): IterableIterator<Relation> {
        for (const rel of this) if (rel.relationModeType === RelationModeType.NORMAL) yield rel;
    }

    /**
     * Generator which iterates over faint relations
     */
    public *faintRelations(): IterableIterator<Relation> {
        for (const rel of this) if (rel.relationModeType === RelationModeType.FAINT) yield rel;
    }

    /**
     * Generator which iterates over visual relations
     */
    public *visualRelations(): IterableIterator<Relation> {
        for (const rel of this) if (rel.relationModeType === RelationModeType.VISUAL) yield rel;
    }

    /**
     * Generator which iterates over normal and visual relations, because those are the only ones to be saved
     */
    public *savableRelations(): IterableIterator<Relation> {
        for (const rel of this) if (rel.relationModeType !== RelationModeType.FAINT) yield rel;
    }

    /**
     * Create a new relation and add it to the graph
     *
     * @param source The source node of the relation
     * @param target The target node of the relation
     * @param relationModeType The type of relation in relation mode, defaults to NORMAL
     * @param labelText An optional text for the relation
     * @param uuid An optional uuid for the relation
     */
    public new(
        source: Node,
        target: Node,
        relationModeType = RelationModeType.NORMAL,
        labelText?: string,
        uuid?: string,
    ): Relation {
        // Create new relation info
        const relationInfo: RelationInfo = {
            uuid: uuid ?? "unknown",
            from: source.reference,
            to: target.reference,
        };

        // Create the link and connect it to source and target
        const link = new shapes.standard.Link();
        link.source(source.jointElement);
        link.target(target.jointElement);
        link.attr({
            line: {
                strokeWidth: 4,
            },
        });

        // Optionally set a label
        if (labelText) {
            link.appendLabel(Relation.makeLabel(labelText, relationModeType));
            relationInfo.label = labelText;
        }

        // Create the relation and add it to the graph
        const relation = new Relation(relationInfo, link, source, target, relationModeType);
        this.addExisting(relation);

        return relation;
    }

    /**
     * Add an existing relation object to the graph
     *
     * @param relation The relation to add
     * @param relationModeType
     */
    public addExisting(relation: Relation, relationModeType?: RelationModeType): void {
        if (relationModeType != null) relation.relationModeType = relationModeType;

        // Add relation to RelationsMap and to the joint js graph
        this.add(relation);
        relation.jointLink.addTo(this.graphHandler.graph.graph);

        // Register the relation on the source and target nodes
        relation.reconnect();

        this.setLinkTools(relation);
    }

    public removeExisting(relation: Relation): void {
        this.remove(relation);
        relation.jointLink.remove();

        // Remove relation from source and target nodes
        relation.disconnect();
    }

    /**
     * Set link tools to a relation according to the type of relation
     *
     * @param relation The relation to add link tools to
     */
    public setLinkTools(relation: Relation): void {
        // Remove all existing tools
        const link = relation.jointLink;
        const linkView = link.findView(this.graphHandler.graph.paper);
        linkView.removeTools();

        let toolsView;

        // Prepare tools based on the relation mode type
        switch (relation.relationModeType) {
            case RelationModeType.VISUAL: {
                // For visual relations, source and target should be editable
                const sourceArrowTool = new linkTools.SourceArrowhead();
                const targetArrowTool = new linkTools.TargetArrowhead();

                // And the visual relation should also be able to be removed
                const removeTool = new linkTools.Remove({
                    action: async (evt, linkView) => {
                        const rel = this.graphHandler.relations.getByJointId(linkView.model.id);
                        if (rel)
                            await this.store.dispatch(
                                "editor/addCommand",
                                new RemoveRelationCommand(this.graphHandler, rel),
                            );
                    },
                });

                toolsView = new dia.ToolsView({
                    tools: [sourceArrowTool, targetArrowTool, removeTool],
                });
                break;
            }
            default: {
                // For all other relations, only vertices and segments should be editable, but they are only shown
                // outside of relation edit mode anyways
                const verticesTool = new linkTools.Vertices({ stopPropagation: false });
                const segmentsTool = new linkTools.Segments({ stopPropagation: false });

                toolsView = new dia.ToolsView({
                    tools: [verticesTool, segmentsTool],
                });
            }
        }

        // Add prepared tools to the link
        linkView.addTools(toolsView);
        linkView.hideTools();
    }

    /**
     * Switch a relation to normal relation mode type
     *
     * @param relation The relation to switch
     */
    public switchToNormal(relation: Relation): void {
        relation.relationModeType = RelationModeType.NORMAL;
        this.setLinkTools(relation);
    }

    /**
     * Switch a relation to visual relation mode type
     *
     * @param relation The relation to switch
     */
    public switchToVisual(relation: Relation): void {
        relation.relationModeType = RelationModeType.VISUAL;
        this.setLinkTools(relation);
    }

    /**
     * Switch a relation to faint relation mode type
     *
     * @param relation The relation to switch
     */
    public switchToFaint(relation: Relation): void {
        relation.relationModeType = RelationModeType.FAINT;
        this.setLinkTools(relation);
    }
}
