<template>
    <div class="container" @mousemove="graph.mousemove">
        <div id="joint" @dragover.prevent @drop="onNodeDrop" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { JointGraph } from "@/shared/JointGraph";
import ApiNode from "@/modules/editor/models/ApiNode";
import { dia } from "jointjs";
import { NeighborUtils } from "@/modules/inventory/modules/neighbor-view/controls/NeighborUtils";
import ApiRelation from "@/modules/editor/models/ApiRelation";

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
            // Utility functions for the neighbor view
            neighborUtils: {} as NeighborUtils,
        };
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
         * Trigger node selection, when a new node is selected in the overview
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
            if (this.selectedNode) this.displaySelectedNode(this.selectedNode as ApiNode);
        },
    },
    mounted(): void {
        // Set up the graph and the controls
        this.graph = new JointGraph("joint");
        this.neighborUtils = new NeighborUtils(this.graph.graph, this.$store);
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
        displaySelectedNode(apiNode: ApiNode) {
            const shape = this.neighborUtils.addNodeToDiagram(apiNode);
            this.selectedElement = shape;

            shape.attr("body/strokeWidth", 0);
        },
        /**
         * Adds nodes and neighbors to the neighbor relation diagram
         */
        addNeighborNodesAndRelations(neighbors: ApiNode[], relations: ApiRelation[]) {
            // Neighbor nodes
            for (const apiNode of neighbors) this.neighborUtils.addNodeToDiagram(apiNode);

            // Neighbor relations
            for (const apiRelation of relations)
                this.neighborUtils.addRelationToDiagram(apiRelation, this.selectedNode as ApiNode);
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
