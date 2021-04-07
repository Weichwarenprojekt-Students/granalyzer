import { Store } from "vuex";
import { RootState } from "@/store";
import { MoveNodeCommand } from "@/modules/editor/modules/graph-editor/controls/commands/MoveNodeCommand";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { Node } from "@/modules/editor/modules/graph-editor/controls/models/Node";
import { dia, shapes } from "jointjs";
import { NodeShapes } from "@/modules/editor/modules/graph-editor/controls/models/NodeShapes";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/models/Relation";

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
        shape.resize(100, 60);
        shape.attr({
            body: {
                fill: node.color ? node.color : "#70FF87",
                strokeWidth: 0,
                rx: 4,
                ry: 4,
                class: "node",
            },
            label: {
                text: node.label,
            },
        });

        // Add the shape to the graph and to the other nodes
        this.graphHandler.nodes.set(shape, node);
        shape.addTo(this.graphHandler.graph.graph);

        return shape;
    }

    /**
     * Add an existing node with a diag element to the graph
     *
     * @param node The node to be added
     * @param diagElement The existing dia.Element of the node
     */
    public addExistingNode(node: Node, diagElement: dia.Element): void {
        this.graphHandler.nodes.set(diagElement, node);
        diagElement.addTo(this.graphHandler.graph.graph);
    }

    /**
     * Removes a node with all its relations from the diagram
     *
     * @param diagElement The element to be removed
     */
    public removeNode(diagElement: dia.Element): void {
        const nodeRef = this.graphHandler.nodes.get(diagElement);
        if (!nodeRef) return;

        // Remove node and relations from the graph handler
        this.graphHandler.nodes.delete(diagElement);
        this.graphHandler.relations.forEach((value, key) => {
            if (value.from == nodeRef.ref || value.to == nodeRef.ref) this.graphHandler.relations.delete(key);
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
     */
    public addRelation(source: dia.Element, target: dia.Element, uuid?: string, labelText?: string): void {
        // Check if the nodes exist
        const from = this.graphHandler.nodes.get(source);
        const to = this.graphHandler.nodes.get(target);
        if (!from || !to) return;

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
                    text: { text: labelText, textAnchor: "middle", textVerticalAnchor: "middle" },
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
        this.graphHandler.relations.set(link, relation);
    }

    /**
     * Remove a relation
     *
     * @param relation The relation to be removed
     */
    public removeRelation(relation: shapes.standard.Link): void {
        this.graphHandler.relations.delete(relation);
        relation.remove();
    }

    /**
     * Listen for node move events
     */
    private registerNodeInteraction(): void {
        // No element selected
        this.graphHandler.graph.paper.on("blank:pointerdown", () =>
            this.store.commit("editor/setSelectedElement", undefined),
        );

        // The move command instance
        let moveCommand: MoveNodeCommand;

        // Save the clicked element and the position of it
        this.graphHandler.graph.paper.on("element:pointerdown", (cell) => {
            this.store.commit("editor/setSelectedElement", cell.model);
            moveCommand = new MoveNodeCommand(this.graphHandler, cell.model);
        });

        // Check if a node was moved
        this.graphHandler.graph.paper.on("element:pointerup", async () => {
            if (!moveCommand || !moveCommand.positionChanged()) return;
            moveCommand.updateStopPosition();
            await this.store.dispatch("editor/addMoveCommand", moveCommand);
        });
    }
}
