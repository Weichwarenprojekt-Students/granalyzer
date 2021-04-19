import { Store } from "vuex";
import { RootState } from "@/store";
import { MoveNodeCommand } from "@/modules/editor/modules/graph-editor/controls/commands/MoveNodeCommand";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { Node } from "@/modules/editor/modules/graph-editor/controls/models/Node";
import { dia, linkTools, shapes } from "jointjs";
import { NodeShapes } from "@/modules/editor/modules/graph-editor/controls/models/NodeShapes";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/models/Relation";
import { getBrightness } from "@/utility";
import { BendRelationCommand } from "@/modules/editor/modules/graph-editor/controls/commands/BendRelationCommand";

export class GraphControls {
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
     * Listen for node move events
     */
    private registerNodeInteraction(): void {
        // Nothing selected
        this.graphHandler.graph.paper.on("blank:pointerdown", () => {
            this.graphHandler.graph.deselectElements();
            this.store.commit("editor/setSelectedElement", undefined);
        });

        // The move command instance
        let moveCommand: MoveNodeCommand | undefined;

        // Node selected
        this.graphHandler.graph.paper.on("element:pointerdown", async (cell) => {
            moveCommand = new MoveNodeCommand(this.graphHandler, cell.model);

            // Set the currently selected node for inspector
            const node = this.graphHandler.nodes.get(cell.model.id);
            await this.store.dispatch("editor/viewNodeInInspector", node?.ref.uuid);

            // Select the clicked element
            if (!this.store.state.editor?.graphEditor?.relationModeActive) {
                this.graphHandler.graph.selectElement(cell);
                this.store.commit("editor/setSelectedElement", cell.model);
            }
        });

        // Relation selected
        this.graphHandler.graph.paper.on("link:pointerdown", async (cell) => {
            // Set the currently selected relation for inspector
            const relation = this.graphHandler.relations.get(cell.model.id);
            await this.store.dispatch("editor/viewRelationInInspector", relation?.uuid);
        });

        // Node unselected
        this.graphHandler.graph.paper.on("element:pointerup", async () => {
            if (moveCommand && moveCommand.positionChanged()) {
                moveCommand.updateStopPosition();
                await this.store.dispatch("editor/addMoveCommand", moveCommand);
            }
            moveCommand = undefined;
        });

        let bendCommand: BendRelationCommand | undefined;

        // Start dragging the vertex of a relation
        this.graphHandler.graph.paper.on("link:pointerdown", async (cell) => {
            bendCommand = new BendRelationCommand(this.graphHandler, cell.model);
        });

        // If the vertices of a relation have changed, add a command to undo/redo
        this.graphHandler.graph.paper.on("link:pointerup", async () => {
            if (bendCommand && bendCommand.verticesHaveChanged()) {
                await this.store.dispatch("editor/addBendRelationCommand", bendCommand);
            }
        });

        this.graphHandler.graph.paper.on("link:pointerdblclick", async () => {
            if (bendCommand && bendCommand.verticesHaveChanged()) {
                await this.store.dispatch("editor/addBendRelationCommand", bendCommand);
            }
        });

        // Show and hide tools for moving links
        this.graphHandler.graph.paper.on("link:mouseenter", (linkView) => {
            if (!this.store.state.editor?.graphEditor?.relationModeActive) linkView.showTools();
        });

        this.graphHandler.graph.paper.on("link:mouseleave", (linkView) => {
            if (!this.store.state.editor?.graphEditor?.relationModeActive) linkView.hideTools();
        });
    }
}
