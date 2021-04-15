import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { Store } from "vuex";
import { RootState } from "@/store";
import { GET } from "@/utility";
import ApiRelation from "@/modules/editor/models/ApiRelation";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/models/Relation";
import { Node } from "@/modules/editor/modules/graph-editor/controls/models/Node";
import { dia, g } from "jointjs";

export class RelationModeControls {
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
        let color = "#bbb";

        if (this.graphHandler.faintRelations.has(id)) {
            // Change values of variables, if necessary
            [deleteFrom, addTo, color] = [addTo, deleteFrom, "#333"];
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
        let color = "#b33";

        if (this.graphHandler.visualRelations.has(id)) {
            // Change values of variables, if necessary
            [deleteFrom, addTo, color] = [addTo, deleteFrom, "#333"];
        } else if (!this.graphHandler.relations.has(id)) return;

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
                        this.graphHandler.controls.addRelation(fromElement, toElement, id, rel.type, true);
                        addedNewRelation = true;
                    }
                });

                // Rearrange overlapping relations if it has a added sibling and is not yet manually positioned
                if (addedNewRelation) {
                    this.adjustSiblingRelations(fromElement, false);
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
    }

    /**
     * Takes care of overlapping relations
     * From: https://resources.jointjs.com/tutorial/multiple-links-between-elements
     *
     * @param element Node of the jointjs diagram
     * @param rearrangeAll Ff false the rearrangement does not apply on links which were already positioned
     */
    public adjustSiblingRelations(element: dia.Element, rearrangeAll = true): void {
        // Get the first link from the element
        const firstConnectedLink = this.graphHandler.graph.graph.getConnectedLinks(element)[0];

        // Exit if node has no relation
        if (!firstConnectedLink) return;

        const link = firstConnectedLink;

        // Get the start and end node id of the relation
        const startId = link.get("source").id || link.previous("source").id;
        const endId = link.get("target").id || link.previous("target").id;

        // Exit if not both endpoints of the relation are set
        if (!startId || !endId) return;

        // identify link siblings
        const siblings = this.getSiblingsOfLink(startId, endId);

        // Prevent overlapping if more than one relation
        if (siblings.length > 1) {
            this.rearrangeLinks(startId, endId, siblings, rearrangeAll);
        }
    }

    /**
     * Get all siblings of the link specified by the ids of both node endpoints
     *
     * @param startId
     * @param endId
     * @private
     */
    private getSiblingsOfLink(startId: string, endId: string) {
        return this.graphHandler.graph.graph.getLinks().filter((sibling) => {
            const siblingStartId = sibling.source().id;
            const siblingEndId = sibling.target().id;

            // if source and target are the same
            // or if source and target are reversed
            return (
                (siblingStartId === startId && siblingEndId === endId) ||
                (siblingStartId === endId && siblingEndId === startId)
            );
        });
    }

    /**
     * Rearrange the links
     *
     * @param startId The id of the start node
     * @param endId The id of the end node
     * @param siblings A list of all sibling links
     * @param rearrangeAll True if all should be arranged
     * @private
     */
    private rearrangeLinks(startId: string, endId: string, siblings: dia.Link[], rearrangeAll: boolean) {
        // Get the middle point of the link
        const sourceCenter = this.graphHandler.graph.graph.getCell(startId).getBBox().center();
        const targetCenter = this.graphHandler.graph.graph.getCell(endId).getBBox().center();
        const midPoint = new g.Line(sourceCenter, targetCenter).midpoint();

        // Get the angle between start and end node
        const theta = sourceCenter.theta(targetCenter);

        // The maximum distance between two sibling links
        const GAP = 120;
        let i = 0;
        siblings.forEach((sibling) => {
            // Ignore already moved relations if flag is false
            if (!rearrangeAll && sibling.vertices().length !== 0) return;

            // Contains calculated vertices
            let vertex = new g.Point(0, 0);

            let atCorrectPosition = false;
            while (!atCorrectPosition) {
                // Offset values like 0, 20, 20, 40, 40, 60, 60 ...
                let offset = GAP * Math.ceil(i / 2);

                // Alternate the direction in which the relation is moved (right/left)
                const sign = i % 2 ? 1 : -1;

                // Keep even numbers of relations symmetric
                if (siblings.length % 2 === 0) {
                    offset -= (GAP / 2) * sign;
                }

                // Make reverse links count the same as non-reverse
                const reverse = theta < 180 ? 1 : -1;

                // Apply the shifted relation
                const angle = g.toRad(theta + sign * reverse * 90);
                vertex = g.Point.fromPolar(offset, angle, midPoint);

                atCorrectPosition = true;
                i++;

                // Check if there is a relation at the same position
                siblings
                    .map((s) => s.vertices())
                    .filter((v) => v.length != 0)
                    .forEach((v) => {
                        if (vertex.distance(new g.Point(v[0])) < 10) {
                            atCorrectPosition = false;
                        }
                    });
            }

            // Replace vertices
            if (vertex) sibling.vertices([vertex]);
        });
    }
}
