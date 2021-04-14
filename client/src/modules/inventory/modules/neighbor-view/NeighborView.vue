<template>
    <div class="container" @mousemove="graph.mousemove">
        <div id="joint" @dragover.prevent @drop="onNodeDrop" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { JointGraph } from "@/shared/JointGraph";
import ApiNode from "@/modules/editor/models/ApiNode";
import { NodeShapes } from "@/modules/editor/modules/graph-editor/controls/models/NodeShapes";
import { getBrightness } from "@/utility";
import { Node } from "@/modules/editor/modules/graph-editor/controls/models/Node";
import { dia, shapes } from "jointjs";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/models/Relation";

export default defineComponent({
    name: "NeighborView",
    props: {
        selectedNode: Object,
    },
    data() {
        return {
            // Graph of the inventory view
            graph: {} as JointGraph,
            // Root element that is currently displayed in the inventory
            selectedElement: {} as dia.Element,
        };
    },
    computed: {
        /**
         * Returns all neighbor nodes of the currently selected inventory-element
         */
        neighborRelations(): Relation[] {
            return this.$store.state.inventory.directRelations;
        },
    },
    watch: {
        /**
         * Load neighbor overview, when neighbors are loaded
         */
        "$store.state.inventory.loading"(loading) {
            if (loading) return;

            const neighbors = this.$store.state.inventory.neighbors;
            const relations = this.$store.state.inventory.directRelations;

            this.addNeighborNodesAndRelations(neighbors, relations);
        },
        /**
         * Trigger node selection, when a new node is selected in the overview // TODO :: Clear previous selection properly
         */
        selectedNode(newValue, oldValue) {
            if (oldValue && oldValue.nodeId === newValue.nodeId) return;

            if (Object.keys(this.selectedElement).length !== 0) {
                this.selectedElement.remove();
                this.$store.state.inventory.mappedNodes.forEach((value: number | string) => {
                    const element = this.graph.graph.getCell(value);
                    if (element) element.remove();
                });
            }

            this.$store.commit("inventory/reset");
            if (this.selectedNode) this.nodeSelected(this.selectedNode as ApiNode);
        },
    },
    mounted(): void {
        // Set up the graph and the controls
        this.graph = new JointGraph("joint");
    },
    methods: {
        /**
         * Check if a node from the overview list was dropped
         */
        // eslint-disable-next-line
        onNodeDrop(): void {
            // Get the selected node
            const node = this.$store.state.inventory.selectedNode;
            if (!node) return;

            console.log("Dropped", node); // TODO :: Add new relation to currently selected node
        },
        /**
         * Displays the node in the neighbor view
         */
        nodeSelected(apiNode: ApiNode) {
            // TODO :: Outsource

            // Create diagram node from api node
            const node: Node = {
                x: 0,
                y: 0,
                shape: "rectangle",
                label: apiNode.label,
                name: apiNode.name,
                ref: { uuid: apiNode.nodeId, index: 0 },
                color: this.$store.state.labelColor.get(apiNode.label)?.color ?? "#70FF87",
            };

            // Create shape from node
            const shape = NodeShapes.parseType(node.shape);
            this.$store.commit("inventory/addNodeToDiagram", { uuid: node.ref.uuid, shapeId: shape.id });

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
            this.selectedElement = shape;

            shape.attr("body/strokeWidth", 0);
        },
        /**
         * Adds nodes and neighbors to the neighbor relation diagram
         */
        addNeighborNodesAndRelations(neighbors: Node[], relations: Relation[]) {
            // Neighbor nodes
            for (const node of neighbors) {
                const shape = NodeShapes.parseType(node.shape);
                this.$store.commit("inventory/addNodeToDiagram", { uuid: node.ref.uuid, shapeId: shape.id });

                shape.position(node.x, node.y);
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
            }

            // Neighbor relations
            for (const relation of relations) {
                // Prevent duplicate relations
                if (this.$store.state.inventory.mappedRelations.has(relation.uuid)) continue;

                // Get direction of the relation
                let source, target;
                source = this.graph.graph.getCell(this.$store.state.inventory.mappedNodes.get(relation.to.uuid));
                target = this.graph.graph.getCell(this.$store.state.inventory.mappedNodes.get(relation.from.uuid));
                if (relation.to.uuid === this.selectedNode?.uuid) [target, source] = [source, target];
                if (!(source && target)) continue;

                const link = new shapes.standard.Link();
                this.$store.commit("inventory/addRelationToDiagram", { uuid: relation.uuid, linkId: link.id });

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
                link.addTo(this.graph.graph);
            }
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global";

.container {
    position: relative;
    background: #f2f2f2;
}
</style>
