import { dia, shapes } from "jointjs";
import { Node } from "@/modules/editor/modules/graph-editor/controls/models/Node";
import ApiNode from "@/models/data-scheme/ApiNode";
import { Store } from "vuex";
import { RootState } from "@/store";
import ApiRelation from "@/models/data-scheme/ApiRelation";
import { NodeShapes } from "@/modules/editor/modules/graph-editor/controls/models/NodeShapes";
import { getBrightness } from "@/utility";
import Cell = dia.Cell;
import { JointGraph } from "@/shared/JointGraph";

/**
 * Provides key functionality for placing nodes and relations
 */
export class NeighborUtils {
    /**
     * Distance between two nodes on a circle
     */
    private stepDistance = 0;

    /**
     * Amount of neighbors already placed
     */
    private neighborsPlaced = 0;

    /**
     * Radius of the circle
     */
    private radius = 0;

    /**
     * Current x position of the shape to be placed
     */
    private currentX = 0;

    /**
     * Current y position of the shape to be placed
     */
    private currentY = 0;

    /**
     *  True, if first node (origin) has been placed
     */
    private rootNodeSet = false;

    /**
     * Maps the uuid of a node to the id of a diagram shape
     */
    public mappedNodes = new Map<string, string | number>();

    /**
     * Maps the uuid of a relation to the id of a diagram link
     */
    public mappedRelations = new Map<string, string | number>();

    /**
     * Constructor
     *
     * @param graph Graph to place nodes/relations into
     * @param store Root Store
     */
    constructor(private graph: JointGraph, private store: Store<RootState>) {
        this.registerNodeInteraction();
    }

    /**
     * Transforms an ApiNode to a node, creates a shape and places it in the graph
     *
     * @param apiNode Node to be placed into the diagram
     * @Return Returns the shape that was added to the graph
     */
    public addNodeToDiagram(apiNode: ApiNode): dia.Element {
        this.calculateNewPosition();

        const node: Node = {
            x: this.currentX,
            y: this.currentY,
            shape: "rectangle",
            label: apiNode.label,
            name: apiNode.name,
            ref: { uuid: apiNode.nodeId, index: 0 },
            color: this.store.state.labelColor.get(apiNode.label)?.color ?? "#70FF87",
        };

        const shape = NodeShapes.parseType(node.shape);
        this.mappedNodes.set(node.ref.uuid, shape.id);

        shape.position(node.x, node.y);
        // Style node
        shape.attr({
            label: {
                text: node.name,
                textAnchor: "middle",
                textVerticalAnchor: "middle",
                fill: getBrightness(node.color) > 170 ? "#333" : "#FFF",
            },
            body: {
                ref: "label",
                fill: node.color,
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
        shape.addTo(this.graph.graph);
        shape.attr("body/strokeWidth", 0);
        this.rootNodeSet = true;

        return shape;
    }

    /**
     * Transforms an ApiRelation to a node, creates a link and places it in the graph
     *
     * @param apiRelation Relation to be placed in the diagram
     */
    public addRelationToDiagram(apiRelation: ApiRelation): shapes.standard.Link | undefined {
        const relation = {
            from: { uuid: apiRelation.from, index: 0 },
            to: { uuid: apiRelation.to, index: 0 },
            uuid: apiRelation.relationId,
            type: apiRelation.type,
        };

        // Prevent duplicate relations
        if (this.mappedRelations.has(relation.uuid)) return;

        // Get direction of the relation
        const source = this.getShapeById(relation.from.uuid);
        const target = this.getShapeById(relation.to.uuid);
        if (!(source && target)) return;

        const link = new shapes.standard.Link();
        this.mappedRelations.set(relation.uuid, link.id);

        link.source(source);
        link.target(target);
        link.attr({
            line: { strokeWidth: 4 },
        });
        link.connector("rounded", { radius: 20 });

        if (relation.type)
            link.appendLabel({
                attrs: {
                    text: { text: relation.type, textAnchor: "middle", textVerticalAnchor: "middle", fill: "#fff" },
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
        link.addTo(this.graph.graph);

        return link;
    }

    /**
     * Define a fitting distance between nodes for the circular alignment
     *
     * @param nNeighbors Amount of neighbor nodes to be placed
     */
    public setStepDistance(nNeighbors: number): void {
        this.stepDistance = (2 * Math.PI) / nNeighbors;
        this.radius = nNeighbors > 9 ? nNeighbors * 50 : nNeighbors > 3 ? 500 : 300;
    }

    /**
     * Reset the positioning of nodes in the graph
     */
    public resetNeighborPlacement(): void {
        this.neighborsPlaced = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.rootNodeSet = false;
    }

    /**
     * Clears the mapped nodes and relations of the previous graph
     */
    public resetGraph(): void {
        this.mappedNodes.clear();
        this.mappedRelations.clear();
    }

    /**
     * Returns the diagram-shape that belongs to a node
     *
     * @param id Id of the node that is supposed to be in the graph
     * @private
     */
    private getShapeById(id: string): Cell | undefined {
        const shapeId = this.mappedNodes.get(id);
        if (shapeId) return this.graph.graph.getCell(shapeId);
        return undefined;
    }

    /**
     * Adjust the x and y position for the next node
     */
    private calculateNewPosition(): void {
        if (!this.rootNodeSet) return;
        const alpha = this.stepDistance * this.neighborsPlaced++ - 0.5 * Math.PI;
        this.currentX = this.radius * Math.cos(alpha);
        this.currentY = this.radius * Math.sin(alpha);
    }

    /**
     * Listen for node move events
     */
    private registerNodeInteraction(): void {
        this.graph.paper.on("element:pointerdblclick", async (cell) => {
            // Get key of element by value
            if (!this.store.state.inventory) return;

            const nodeId = [...this.mappedNodes].find(([, value]) => value === cell.model.id);

            if (!nodeId) return;
            const node = await this.store.dispatch("inventory/getNode", nodeId[0]);

            this.store.commit("inventory/setSelectedNode", node);
            this.store.commit("inventory/reset");
            await this.store.dispatch("inventory/loadRelations", node);
        });
    }
}