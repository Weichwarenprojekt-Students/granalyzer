import { Store } from "vuex";
import { RootState } from "@/store";
import { MoveNodeCommand } from "@/modules/editor/modules/graph-editor/controls/commands/MoveNodeCommand";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { Node } from "@/modules/editor/modules/graph-editor/controls/models/Node";
import { dia, linkTools, shapes } from "jointjs";
import { NodeShapes } from "@/modules/editor/modules/graph-editor/controls/models/NodeShapes";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/models/Relation";
import { GET, getBrightness } from "@/utility";
import ApiRelation from "@/modules/editor/models/ApiRelation";
import { ChangeRelationVertexCommand } from "@/modules/editor/modules/graph-editor/controls/commands/ChangeRelationVertexCommand";

export class GraphControls {
    /**
     * Is set in the methods switchRelationsForActiveRelationMode() and ...ForInactiveRelationMode(), to indicate
     * if the relation edit mode is active
     */
    private _relationModeActive = false;

    /**
     * True if the relation mode is active
     */
    public get relationModeActive(): boolean {
        return this._relationModeActive;
    }

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
     * Add a node to the diagram
     *
     * @param node The node to be added
     */
    public addNode(node: Node): dia.Element {
        // Check if a node of this type was already registered and update the ref
        let index = -1;
        this.graphHandler.nodes.forEach((value) => {
            if (node.ref.uuid == value.ref.uuid) index = Math.max(index, value.ref.index);
        });
        if (index >= 0) node.ref.index = index + 1;

        // Create the shape
        const shape = NodeShapes.parseType(node.shape);
        shape.position(node.x, node.y);

        // Try to find the matching label color and use default otherwise
        const nodeColor = this.store.state.labelColor.get(node.label)?.color ?? "#70FF87";

        // Style node
        shape.attr({
            label: {
                text: node.name,
                textAnchor: "middle",
                textVerticalAnchor: "middle",
                fill: getBrightness(nodeColor) > 170 ? "#333" : "#FFF",
            },
            body: {
                ref: "label",
                fill: nodeColor,
                strokeWidth: 1,
                rx: 4,
                ry: 4,
                refWidth: 32,
                refHeight: 16,
                refX: -16,
                refY: -8,
                class: "node",
            },
        });

        // Add the shape to the graph and to the other nodes
        this.graphHandler.nodes.set(shape.id, node);
        shape.addTo(this.graphHandler.graph.graph);

        // Update some svg attribute, so that style gets shown correctly from the beginning
        // Needs to be done, don't ask why...
        shape.attr("body/strokeWidth", 0);

        return shape;
    }

    /**
     * Add an existing node with a diag element to the graph
     *
     * Used by undo redo
     *
     * @param node The node to be added
     * @param diagElement The existing dia.Element of the node
     */
    public addExistingNode(node: Node, diagElement: dia.Element): void {
        this.graphHandler.nodes.set(diagElement.id, node);
        diagElement.addTo(this.graphHandler.graph.graph);

        // Update some svg attribute, so that style gets shown correctly from the beginning
        // Needs to be done, don't ask why...
        diagElement.attr("body/strokeWidth", 3);
        diagElement.attr("body/strokeWidth", 0);
    }

    /**
     * Removes a node with all its relations from the diagram
     *
     * @param diagElement The element to be removed
     */
    public removeNode(diagElement: dia.Element): void {
        const nodeRef = this.graphHandler.nodes.get(diagElement.id);
        if (!nodeRef) return;

        // Remove node and relations from the graph handler
        this.graphHandler.nodes.delete(diagElement.id);
        this.graphHandler.relations.forEach((rel, id) => {
            if (rel.from == nodeRef.ref || rel.to == nodeRef.ref) this.graphHandler.relations.delete(id);
        });

        // Remove node and relations from the diagram
        diagElement.remove();
    }

    /**
     * Add a new relation
     *
     * @param source The source element
     * @param target The target element
     * @param uuid An optional uuid for the relation
     * @param labelText An optional label for the relation
     * @param asFaintRelation True if the relation should be added as a faint relation
     */
    public addRelation(
        source: dia.Element,
        target: dia.Element,
        uuid?: string,
        labelText?: string,
        asFaintRelation?: boolean,
    ): string | number | undefined {
        // Check if the nodes exist
        const from = this.graphHandler.nodes.get(source.id);
        const to = this.graphHandler.nodes.get(target.id);
        if (!from || !to) return undefined;

        // Create the node relation
        const relation: Relation = {
            uuid,
            type: labelText,
            from: from.ref,
            to: to.ref,
        };

        // Create the link
        const link = new shapes.standard.Link();
        link.source(source);
        link.target(target);
        link.attr({
            line: {
                strokeWidth: 4,
            },
        });
        link.connector("rounded", { radius: 20 });

        if (labelText)
            link.appendLabel({
                attrs: {
                    text: { text: labelText, textAnchor: "middle", textVerticalAnchor: "middle", fill: "#fff" },
                    rect: {
                        ref: "text",
                        fill: "#333",
                        stroke: "#fff",
                        strokeWidth: 0,
                        refX: "-10%",
                        refY: "-4%",
                        refWidth: "120%",
                        refHeight: "108%",
                        rx: 0,
                        ry: 0,
                    },
                },
            });

        // Add the relation to the graph and to the other links
        link.addTo(this.graphHandler.graph.graph);

        // Check if relation should be added as faint relation
        if (asFaintRelation) {
            link.attr({ rect: { fill: "#bbb" }, line: { stroke: "#bbb" } });
            this.graphHandler.faintRelations.set(link.id, relation);
        } else {
            this.graphHandler.relations.set(link.id, relation);
        }

        this.addLinkTools(link);

        return link.id;
    }

    /**
     * Add an already existing relation object to the graph
     *
     * @param link The link object to add
     * @param relation The corresponding relation object to add
     */
    public addExistingRelation(link: dia.Element, relation: Relation): void {
        link.addTo(this.graphHandler.graph.graph);

        link.attr({ rect: { fill: "#333" }, line: { stroke: "#333" } });
        this.graphHandler.relations.set(link.id, relation);

        this.addLinkTools(link);
    }

    /**
     * Add link tools to a link, so that vertices and segments can be manipulated
     *
     * @param link The link to add the link tools to
     * @private
     */
    private addLinkTools(link: dia.Element | shapes.standard.Link) {
        // Prepare link tools for modifying vertices and segments
        const verticesTool = new linkTools.Vertices({ stopPropagation: false });
        const segmentsTool = new linkTools.Segments({ stopPropagation: false });
        const toolsView = new dia.ToolsView({
            tools: [verticesTool, segmentsTool],
        });

        // Add these tools to the link
        const linkView = link.findView(this.graphHandler.graph.paper);
        linkView.addTools(toolsView);
        linkView.hideTools();
    }

    /**
     * Remove a relation
     *
     * @param relation The relation to be removed
     */
    public removeRelation(relation: dia.Element): void {
        this.graphHandler.relations.delete(relation.id);
        this.graphHandler.faintRelations.delete(relation.id);
        this.graphHandler.visualRelations.delete(relation.id);
        relation.remove();
    }

    /**
     * Process all relations for an activated relation edit mode
     */
    public async switchRelationsForActiveRelationMode(): Promise<void> {
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
                console.log(relation.uuid, typeof relation.uuid);
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

        this._relationModeActive = true;
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
                        this.addRelation(fromElement, toElement, id, rel.type, true);
                        addedNewRelation = true;
                    }
                });

                // Rearrange overlapping relations if it has a added sibling and is not yet manually positioned
                if (addedNewRelation) {
                    this.graphHandler.adjustSiblingRelations(fromElement, false);
                }
            });
        });
    }

    /**
     * Switch all relations back from an active relation edit mode
     */
    public switchRelationsForInactiveRelationMode(): void {
        // Remove all faint relations
        this.graphHandler.faintRelations.forEach((node, id) => {
            this.removeRelation(this.graphHandler.getCellById(id));
        });

        // Switch visual relations to normally displayed relations
        this.graphHandler.visualRelations.forEach((node, id) => {
            this.switchVisualRelation(id);
        });

        this._relationModeActive = false;
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
        // No element selected
        this.graphHandler.graph.paper.on("blank:pointerdown", () => {
            this.graphHandler.graph.deselectElements();
            this.store.commit("editor/setSelectedElement", undefined);
        });

        // The move command instance
        let moveCommand: MoveNodeCommand | undefined;

        // Save the clicked element and the position of it
        this.graphHandler.graph.paper.on("element:pointerdown", (cell) => {
            moveCommand = new MoveNodeCommand(this.graphHandler, cell.model);
            if (!this.store.getters["editor/relationModeActive"]) {
                this.graphHandler.graph.selectElement(cell);
                this.store.commit("editor/setSelectedElement", cell.model);
            }
        });

        // Check if a node was moved
        this.graphHandler.graph.paper.on("element:pointerup", async () => {
            if (moveCommand && moveCommand.positionChanged()) {
                moveCommand.updateStopPosition();
                await this.store.dispatch("editor/addMoveCommand", moveCommand);
            }
            moveCommand = undefined;
        });

        let verticesCommand: ChangeRelationVertexCommand | undefined;

        // Switch db relations on mouse click
        this.graphHandler.graph.paper.on("link:pointerdown", async (cell) => {
            verticesCommand = new ChangeRelationVertexCommand(this.graphHandler, cell.model);

            if (this.store.getters["editor/relationModeActive"]) {
                if (this.graphHandler.relations.has(cell.model.id)) {
                    await this.store.dispatch("editor/disableDbRelation", cell.model);
                } else if (this.graphHandler.faintRelations.has(cell.model.id)) {
                    await this.store.dispatch("editor/enableDbRelation", cell.model);
                }
            }
        });

        // If the vertices of a relation have changed, add a command to undo/redo
        this.graphHandler.graph.paper.on("link:pointerup", async () => {
            console.log("oh");
            if (verticesCommand && verticesCommand.verticesHaveChanged()) {
                console.log("yeah");
                await this.store.dispatch("editor/addChangeRelationVerticesCommand", verticesCommand);
            }
        });

        // Show and hide tools for moving links
        this.graphHandler.graph.paper.on("link:mouseenter", (linkView) => {
            if (!this.store.getters["editor/relationModeActive"]) linkView.showTools();
        });

        this.graphHandler.graph.paper.on("link:mouseleave", (linkView) => {
            if (!this.store.getters["editor/relationModeActive"]) linkView.hideTools();
        });
    }
}
