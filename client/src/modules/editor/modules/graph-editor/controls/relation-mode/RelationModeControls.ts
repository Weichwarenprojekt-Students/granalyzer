import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { Store } from "vuex";
import { RootState } from "@/store";
import { GET } from "@/utility";
import ApiRelation from "@/models/data-scheme/ApiRelation";
import { dia } from "jointjs";
import { VisualRelationControls } from "@/modules/editor/modules/graph-editor/controls/relation-mode/VisualRelationControls";
import { DisableDbRelationCommand } from "@/modules/editor/modules/graph-editor/controls/relations/commands/DisableDbRelationCommand";
import { EnableDbRelationCommand } from "@/modules/editor/modules/graph-editor/controls/relations/commands/EnableDbRelationCommand";
import { ICommand } from "@/modules/editor/modules/graph-editor/controls/models/ICommand";
import { RelationModeType } from "@/modules/editor/modules/graph-editor/controls/relations/models/RelationModeType";

export class RelationModeControls {
    /**
     * Controls for managing visual relations
     * @private
     */
    private visualRelationControls: VisualRelationControls;

    /**
     * Constructor
     *
     * @param graphHandler The graph handler object
     * @param store The vuex store
     */
    constructor(private graphHandler: GraphHandler, private store: Store<RootState>) {
        this.visualRelationControls = new VisualRelationControls(this.graphHandler, store);
    }

    /**
     * True if the relation mode is active
     */
    public get active(): boolean {
        return !!this.store.state.editor?.graphEditor?.relationModeActive;
    }

    /**
     * Enable relation mode and process all relations accordingly
     */
    public async enable(): Promise<void> {
        // Generate a set of all node uuids
        const uniqueNodeIds = new Set(
            Array.from(this.graphHandler.nodes, (node) => {
                return node.reference.uuid;
            }),
        );

        // Send api requests all at once to get all relations directly connected to all nodes
        const apiRelations = await Promise.all(
            [...uniqueNodeIds].map(
                async (id) => (await (await GET(`/api/nodes/${id}/relations`)).json()) as ApiRelation,
            ),
        );

        // Filter out duplicate relations by assigning them by their uuid to a map
        const relationMap = new Map<string, ApiRelation>();
        apiRelations.flat().forEach((rel) => {
            relationMap.set(rel.relationId, rel);
        });

        // Prepare a set which will be filled with all DB relations which are already present in the graph
        const alreadyPresentRelations = new Set<string>();

        for (const relation of this.graphHandler.relations) {
            const apiRel = relationMap.get(relation.uuid);

            if (
                apiRel &&
                apiRel.from === relation.relationInfo.from.uuid &&
                apiRel.to === relation.relationInfo.to.uuid
            ) {
                // If the api relation with the same uuid has the same start and end node, register it as found db relation
                alreadyPresentRelations.add(
                    `${relation.uuid}-${relation.relationInfo.from.uuid}.${relation.relationInfo.from.index}` +
                        `-${relation.relationInfo.to.uuid}.${relation.relationInfo.to.index}`,
                );
            } else {
                // Else it's a visual relation
                this.graphHandler.relations.switchToVisual(relation);
            }
        }

        // Add all api relations as faint db relations that are not present in the graph yet
        this.addFaintRelations(relationMap, alreadyPresentRelations);
    }

    /**
     * Switch all relations back from an active relation edit mode
     */
    public disable(): void {
        // Remove any temporary visual relations
        this.visualRelationControls.cancelDrawing();

        // Remove all faint relations
        for (const faintRel of this.graphHandler.relations.faintRelations()) {
            this.graphHandler.relations.removeExisting(faintRel);
        }

        for (const visualRel of this.graphHandler.relations.visualRelations()) {
            const link = visualRel.jointLink;

            // Get IDs of source and target elements, if either is not an element but a point, id is undefined
            const [sourceId, targetId] = [link.source()?.id, link.target()?.id];

            if (sourceId == null || targetId == null) {
                // One or both endpoints are not connected to an element, relation should be reset
                visualRel.jointLink.source(visualRel.sourceNode.jointElement);
                visualRel.jointLink.target(visualRel.targetNode.jointElement);
            }

            // Switch relation to normally displayed relation
            this.graphHandler.relations.switchToNormal(visualRel);
        }
    }

    /**
     * Switch DB and faint relations to the other type
     *
     * @param linkView The LinkView of the relation to switch
     */
    public async switchRelation(linkView: dia.LinkView): Promise<void> {
        // Only switch when relation mode is active
        if (this.store.state.editor?.graphEditor?.relationModeActive) {
            // Get the corresponding relation to the link, if there isn't one cancel
            const relation = this.graphHandler.relations.getByJointId(linkView.model.id);
            if (relation == null) return;

            // Switch the relation depending on the current type
            let command: ICommand;

            if (relation.relationModeType === RelationModeType.NORMAL) {
                command = new DisableDbRelationCommand(this.graphHandler, relation);
            } else if (relation.relationModeType === RelationModeType.FAINT) {
                command = new EnableDbRelationCommand(this.graphHandler, relation);
            } else return;

            await this.store.dispatch("editor/addCommand", command);
        }
    }

    /**
     * Callback for clicking an element in the graph, manages drawing new visual relation
     *
     * @param elementView The clicked ElementView
     * @param evt The corresponding event
     * @param x The x coordinate of the click
     * @param y The y coordinate of the click
     */
    public async elementClick(elementView: dia.ElementView, evt: dia.Event, x: number, y: number): Promise<void> {
        if (!this.visualRelationControls.isDrawing) {
            // If not drawing yet, start drawing a new visual relation
            this.visualRelationControls.startDrawing(elementView, evt, x, y);
        } else {
            // Else end drawing the current visual relation
            await this.visualRelationControls.endDrawing(elementView);
        }
    }

    /**
     * Mousemove callback
     */
    // eslint-disable-next-line
    public mousemove(event: any) {
        // Pass through to attach new visual relations to the mouse pointer while drawing
        this.visualRelationControls.mousemove(event);
    }

    /**
     * Callback for a newly connected relation
     *
     * @param linkView The LinkView of the relation whose connection was changed
     */
    public async connectRelation(linkView: dia.LinkView): Promise<void> {
        // Pass through to visual relation controls
        await this.visualRelationControls.changeRelationConnection(linkView);
    }

    /**
     * Add api relations as faint relations if they are not present in the graph yet
     *
     * @param relationMap The relations from the api
     * @param alreadyPresentRelations The relations that are already present in the graph
     * @private
     */
    private addFaintRelations(relationMap: Map<string, ApiRelation>, alreadyPresentRelations: Set<string>) {
        relationMap.forEach((rel, id) => {
            // For each node which is a possible source of the relation
            for (const fromNode of this.graphHandler.nodes.getByUuid(rel.from).values()) {
                // Detect if there is a new relation appended to the current node
                let addedNewRelation = false;

                // For each node which is a possible target of the relation
                for (const toNode of this.graphHandler.nodes.getByUuid(rel.to).values()) {
                    if (
                        !alreadyPresentRelations.has(
                            `${rel.relationId}-${fromNode.reference.uuid}.${fromNode.reference.index}` +
                                `-${toNode.reference.uuid}.${toNode.reference.index}`,
                        )
                    ) {
                        // If the relation between fromNode and toNode is not yet present in the graph add it
                        this.graphHandler.relations.new(fromNode, toNode, RelationModeType.FAINT, rel.type, id);
                        addedNewRelation = true;
                    }
                }

                // Rearrange overlapping relations if it has a added sibling and is not yet manually positioned
                if (addedNewRelation)
                    this.graphHandler.graph.rearrangeOverlappingRelations(fromNode.jointElement, false);
            }
        });
    }
}
