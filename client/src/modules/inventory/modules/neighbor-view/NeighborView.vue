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
        // Currently selected node in the overview list
        selectedNode: Object,
    },
    data() {
        return {
            // Graph of the inventory view
            graph: {} as JointGraph,
            // Root element that is currently displayed in the inventory
            currentlyDisplayedShape: {} as dia.Element,
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
            const relations = this.$store.state.inventory.relations;

            this.neighborUtils.setStepDistance(neighbors.length);
            this.addNeighborNodesAndRelations(neighbors, relations);
        },
        /**
         * Trigger node selection, when a new node is selected in the overview
         */
        selectedNode(newValue, oldValue) {
            if (oldValue && oldValue.nodeId === newValue.nodeId) return;

            if (Object.keys(this.currentlyDisplayedShape).length !== 0) this.graph.graph.clear();

            this.neighborUtils.resetGraphPositioning();
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
            this.currentlyDisplayedShape = shape;

            shape.attr("body/strokeWidth", 0);
        },
        /**
         * Adds nodes and neighbors to the neighbor relation diagram
         */
        addNeighborNodesAndRelations(neighbors: ApiNode[], relations: ApiRelation[]) {
            // Neighbor nodes
            for (const apiNode of neighbors) this.neighborUtils.addNodeToDiagram(apiNode);

            // Neighbor relations
            for (const apiRelation of relations) this.neighborUtils.addRelationToDiagram(apiRelation);
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
