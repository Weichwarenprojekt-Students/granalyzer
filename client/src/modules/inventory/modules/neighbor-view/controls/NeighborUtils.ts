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
// TODO :: Circular alignment of nodes

export class NeighborUtils {
    constructor(private graph: dia.Graph, private store: Store<RootState>) {}

    public addNodeToDiagram(apiNode: ApiNode): dia.Element {
        const node: Node = {
            x: 0,
            y: 0,
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

        return shape;
    }

    private getShapeById(id: string): Cell | undefined {
        const shapeId = this.store.state.inventory?.mappedNodes.get(id);
        if (shapeId) return this.graph.getCell(shapeId);
        return undefined;
    }

    public addRelationToDiagram(apiRelation: ApiRelation, rootNode: ApiNode): shapes.standard.Link | undefined {
        const relation = {
            from: { uuid: apiRelation.from, index: 0 },
            to: { uuid: apiRelation.to, index: 0 },
            uuid: apiRelation.relationId,
            type: apiRelation.type,
        };

        // Prevent duplicate relations
        if (this.store.state.inventory?.mappedRelations.has(relation.uuid)) return;

        // Get direction of the relation
        let source, target;
        source = this.getShapeById(relation.to.uuid);
        target = this.getShapeById(relation.from.uuid);
        if (relation.to.uuid === rootNode.nodeId) [target, source] = [source, target];
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
}
