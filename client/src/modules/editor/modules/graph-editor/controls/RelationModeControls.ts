import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { Store } from "vuex";
import { RootState } from "@/store";
import { GET } from "@/utility";
import ApiRelation from "@/models/data-scheme/ApiRelation";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/models/Relation";
import { Node } from "@/modules/editor/modules/graph-editor/controls/models/Node";
import { dia, g, shapes } from "jointjs";

export class RelationModeControls {
    /**
     * Reference to a new visual relation while it's being drawn
     */
    private newVisualRelation?: dia.Link;

    /**
     * Constructor
     *
     * @param graphHandler The graph handler object
     * @param store The vuex store
     */
    constructor(private graphHandler: GraphHandler, private store: Store<RootState>) {
        this.registerNodeInteraction();
    }

    /**
     * True if the relation mode is active
     */
    public get active(): boolean {
        return !!this.store.state.editor?.graphEditor?.relationModeActive;
    }

    /**
     * Process all relations for an activated relation edit mode
     */
    public async enable(): Promise<void> {
        // Generate a set of all node uuids
        const uniqueNodeIds = new Set(
            Array.from(this.graphHandler.nodes.values(), (node) => {
                return node.ref.uuid;
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

        this.graphHandler.relations.forEach((relation, id) => {
            if (!relation.uuid) {
                // If the relation has no uuid, it can't be synchronized with the DB and is a visual relation
                this.switchVisualRelation(id);
                return;
            }
            const apiRel = relationMap.get(relation.uuid);
            if (apiRel && apiRel.from === relation.from.uuid && apiRel.to === relation.to.uuid) {
                // If the api relation with the same uuid has the same start and end node, register it as found db relation
                alreadyPresentRelations.add(
                    `${relation.uuid}-${relation.from.uuid}.${relation.from.index}-${relation.to.uuid}.${relation.to.index}`,
                );
            } else {
                // If it doesn't have the same start and end nodes, it's a visual relation
                this.switchVisualRelation(id);
            }
        });

        // Add all api relations as faint db relations that are not present in the graph yet
        this.addFaintRelations(relationMap, alreadyPresentRelations);
    }

    /**
     * Switch all relations back from an active relation edit mode
     */
    public disable(): void {
        // Deactivate drawing of new visual relations
        if (this.newVisualRelation) {
            this.newVisualRelation.remove();
            this.newVisualRelation = undefined;
        }

        // Remove all faint relations
        this.graphHandler.faintRelations.forEach((node, id) => {
            this.graphHandler.controls.removeRelation(this.graphHandler.getCellById(id));
        });

        // Switch visual relations to normally displayed relations
        this.graphHandler.visualRelations.forEach((node, id) => {
            this.switchVisualRelation(id);
        });
    }

    /**
     * Switch a DB relation to be faint or not
     * @param id The id of the relation to switch
     */
    public switchDbRelation(id: string | number): void {
        // Set up variables
        let deleteFrom = this.graphHandler.relations;
        let addTo = this.graphHandler.faintRelations;
        let color = this.graphHandler.FAINT_RELATION_COLOR;

        if (this.graphHandler.faintRelations.has(id)) {
            // Change values of variables, if necessary
            [deleteFrom, addTo, color] = [addTo, deleteFrom, this.graphHandler.NORMAL_RELATION_COLOR];
        } else if (!this.graphHandler.relations.has(id)) return;

        this.switchRelation(id, deleteFrom, addTo, color);
    }

    /**
     * Switch a visual relation to be colored or not
     * @param id The id of the relation to switch
     */
    public switchVisualRelation(id: string | number): void {
        // Set up variables
        let deleteFrom = this.graphHandler.relations;
        let addTo = this.graphHandler.visualRelations;
        let color = this.graphHandler.VISUAL_RELATION_COLOR;

        const link = this.graphHandler.getLinkById(id);
        if (this.graphHandler.relations.has(id)) {
            link.set("isVisualRelation", true);

            // Add link tools for visual relations
            this.graphHandler.controls.addLinkTools(link, true);
        } else if (this.graphHandler.visualRelations.has(id)) {
            link.set("isVisualRelation", false);

            // Change values of variables, if necessary
            [deleteFrom, addTo, color] = [addTo, deleteFrom, this.graphHandler.NORMAL_RELATION_COLOR];

            // Add standard link tools
            this.graphHandler.controls.addLinkTools(link);
        } else return;

        this.switchRelation(id, deleteFrom, addTo, color);
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
            const fromNodes = [] as Array<[Node, string | number]>;
            const toNodes = [] as Array<[Node, string | number]>;

            // Get all possible start and end nodes for this relation
            this.graphHandler.nodes.forEach((node, jointUuid) => {
                // Find nodes with start uuid
                if (rel.from === node.ref.uuid) {
                    fromNodes.push([node, jointUuid]);
                } else if (rel.to === node.ref.uuid) {
                    toNodes.push([node, jointUuid]);
                }
            });

            // Add this faint relation to all nodes, where it is not present yet
            fromNodes.forEach(([nodeFrom, jointUuidFrom]) => {
                const fromElement = this.graphHandler.getCellById(jointUuidFrom);

                // Detect if there is a new relation appended to the current node
                let addedNewRelation = false;

                toNodes.forEach(([nodeTo, jointUuidTo]) => {
                    if (
                        rel.to === nodeTo.ref.uuid &&
                        !alreadyPresentRelations.has(
                            `${rel.relationId}-${nodeFrom.ref.uuid}.${nodeFrom.ref.index}-${nodeTo.ref.uuid}.${nodeTo.ref.index}`,
                        )
                    ) {
                        const toElement = this.graphHandler.getCellById(jointUuidTo);
                        this.graphHandler.controls.addRelation(fromElement, toElement, id, rel.type, "faint");
                        addedNewRelation = true;
                    }
                });

                // Rearrange overlapping relations if it has a added sibling and is not yet manually positioned
                if (addedNewRelation) {
                    this.graphHandler.graph.rearrangeOverlappingRelations(fromElement, false);
                }
            });
        });
    }

    /**
     * Switch a relation from one state to another
     *
     * @param id Id of the relation
     * @param deleteFrom Where to delete the relation from
     * @param addTo Where to add the relation to
     * @param color The color of the switched relation
     * @private
     */
    private switchRelation(
        id: string | number,
        deleteFrom: Map<string | number, Relation>,
        addTo: Map<string | number, Relation>,
        color: string,
    ) {
        const diagEl = this.graphHandler.getCellById(id);
        if (!diagEl) return;

        // Switch the relation
        const rel = deleteFrom.get(id);
        deleteFrom.delete(id);
        if (rel) addTo.set(id, rel);

        // Set new style
        diagEl.attr({ rect: { fill: color }, line: { stroke: color } });
    }

    /**
     * Begin drawing a visual relation
     * @param source Source element
     * @param currentPoint The current point at which to start drawing the target of the relation
     */
    public beginDrawingVisualRelation(source: dia.Element, currentPoint: g.Point): dia.Link {
        // Create the link
        const link = new shapes.standard.Link();
        link.source(source);
        link.target(currentPoint);
        link.attr({
            line: {
                strokeWidth: 4,
            },
        });
        link.connector("rounded", { radius: 20 });

        // Add the relation to the graph and to the other links
        link.addTo(this.graphHandler.graph.graph);

        // Set color of the relation to be a visual relation
        link.attr({
            rect: { fill: this.graphHandler.VISUAL_RELATION_COLOR },
            line: { stroke: this.graphHandler.VISUAL_RELATION_COLOR },
        });

        return link;
    }

    /**
     * Listen for node move events
     */
    private registerNodeInteraction(): void {
        // Switch db relations on mouse click
        this.graphHandler.graph.paper.on("link:pointerdown", async (cell) => {
            if (this.store.state.editor?.graphEditor?.relationModeActive) {
                if (this.graphHandler.relations.has(cell.model.id)) {
                    await this.store.dispatch("editor/disableDbRelation", cell.model);
                } else if (this.graphHandler.faintRelations.has(cell.model.id)) {
                    await this.store.dispatch("editor/enableDbRelation", cell.model);
                }
            }
        });

        // Begin or end drawing a new visual relation
        this.graphHandler.graph.paper.on("element:pointerclick", (cellView: dia.ElementView, evt, x, y) => {
            if (this.store.state.editor?.graphEditor?.relationModeActive) {
                if (!this.newVisualRelation) {
                    // Begin drawing
                    this.newVisualRelation = this.beginDrawingVisualRelation(cellView.model, new g.Point(x, y));
                } else {
                    // End drawing
                    this.newVisualRelation.target(cellView.model);

                    // Get source and target id
                    const sourceId = this.newVisualRelation.source().id;
                    const targetId = this.newVisualRelation.target().id;

                    // Remove relation in any case, so that it can be added again if it should be added
                    this.newVisualRelation.remove();

                    if (sourceId && targetId) {
                        // If sourceId or targetId are undefined, source or target are a Point
                        const relation = {
                            from: this.graphHandler.nodes.get(sourceId)?.ref,
                            to: this.graphHandler.nodes.get(targetId)?.ref,
                        } as Relation;

                        // Add relation to the graph
                        this.graphHandler.controls.addExistingRelation(this.newVisualRelation, relation, "visual");

                        // Adapt relations if any are overlapping
                        this.graphHandler.graph.rearrangeOverlappingRelations(cellView.model, false);
                    }

                    this.newVisualRelation = undefined;
                }
            }
        });

        // Interrupt drawing a new visual relation
        this.graphHandler.graph.paper.on("blank:pointerclick", () => {
            if (this.store.state.editor?.graphEditor?.relationModeActive && this.newVisualRelation) {
                this.newVisualRelation.remove();
                this.newVisualRelation = undefined;
            }
        });
    }

    /**
     * Mousemove callback
     */
    // eslint-disable-next-line
    public mousemove(event: any): void {
        if (this.store.state.editor?.graphEditor?.relationModeActive && this.newVisualRelation) {
            // During drawing of new visual relation, connect the new relation target to the mouse position
            requestAnimationFrame(() => {
                if (this.newVisualRelation) {
                    const sourcePoint = this.newVisualRelation.getSourcePoint();
                    const targetPoint = this.graphHandler.graph.paper.clientToLocalPoint(event.clientX, event.clientY);

                    // Calculate unit vector of connection between source and mouse point
                    const unitDirection = targetPoint.difference(sourcePoint).normalize(1);

                    // Set new target to mouse position, but with a distance of a few pixel so that click events
                    // aren't registered on the new link of the visual relation, but on other elements
                    this.newVisualRelation.target(targetPoint.difference(unitDirection.scale(10, 10)));
                }
            });
        }
    }
}
