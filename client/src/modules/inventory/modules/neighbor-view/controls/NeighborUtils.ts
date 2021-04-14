import { dia, shapes } from "jointjs";
import { Node } from "@/modules/editor/modules/graph-editor/controls/models/Node";
import ApiNode from "@/modules/editor/models/ApiNode";
import { Store } from "vuex";
import { RootState } from "@/store";
import ApiRelation from "@/modules/editor/models/ApiRelation";
import { NodeShapes } from "@/modules/editor/modules/graph-editor/controls/models/NodeShapes";
import { getBrightness } from "@/utility";
import Cell = dia.Cell;

// TODO :: Docstrings
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
     * Constructor
     *
     * @param graph Graph to place nodes/relations into
     * @param store Root Store
     */
    constructor(private graph: dia.Graph, private store: Store<RootState>) {}

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
        this.store.commit("inventory/addNodeToDiagram", { uuid: node.ref.uuid, shapeId: shape.id });

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
        shape.addTo(this.graph);
        shape.attr("body/strokeWidth", 0);
        this.rootNodeSet = true;

        return shape;
    }

    /**
     * Returns the diagram-shape that belongs to a node
     *
     * @param id Id of the node that is supposed to be in the graph
     * @private
     */
    private getShapeById(id: string): Cell | undefined {
        const shapeId = this.store.state.inventory?.mappedNodes.get(id);
        if (shapeId) return this.graph.getCell(shapeId);
        return undefined;
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
        if (this.store.state.inventory?.mappedRelations.has(relation.uuid)) return;

        // Get direction of the relation
        const source = this.getShapeById(relation.to.uuid);
        const target = this.getShapeById(relation.from.uuid);
        // TODO :: Check if relation directions are valid
        // if (relation.to.uuid === rootNode.nodeId) [target, source] = [source, target];
        if (!(source && target)) return;

        const link = new shapes.standard.Link();
        this.store.commit("inventory/addRelationToDiagram", { uuid: relation.uuid, linkId: link.id });

        link.source(source);
        link.target(target);
        link.attr({
            line: { strokeWidth: 4 },
        });
        link.connector("rounded", { radius: 20 });

        if (relation.type)
            link.appendLabel({
                attrs: {
                    text: { text: relation.type, textAnchor: "middle", textVerticalAnchor: "middle" },
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
        link.addTo(this.graph);

        return link;
    }

    /**
     * Define a fitting distance between nodes for the circular alignment
     *
     * @param nNeighbors Amount of neighbor nodes to be placed
     */
    public setStepDistance(nNeighbors: number): void {
        this.stepDistance = (2 * Math.PI) / nNeighbors;
        this.radius = nNeighbors > 10 ? nNeighbors * 40 : nNeighbors < 5 ? 500 : nNeighbors * 60;
    }

    /**
     * Reset the positioning of nodes in the graph
     */
    public resetGraphPositioning(): void {
        this.neighborsPlaced = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.rootNodeSet = false;
    }

    /**
     * Adjust the x and y position for the next node
     */
    private calculateNewPosition(): void {
        if (!this.rootNodeSet) return;
        const alpha = this.stepDistance * this.neighborsPlaced++;
        this.currentX = this.radius * Math.cos(alpha);
        this.currentY = this.radius * Math.sin(alpha);
    }
}
