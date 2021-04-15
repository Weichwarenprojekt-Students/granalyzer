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
            selectedNodeShape: {} as dia.Element,
            // Utility functions for the neighbor view
            neighborUtils: {} as NeighborUtils,
        };
    },
    watch: {
        /**
         * Display graph once all neighbors and relations are in the store
         */
        "$store.state.inventory.loading"(loading) {
            if (loading) return;
            this.graphLoaded();
        },
    },
    mounted(): void {
        // Set up the graph and the controls
        this.graph = new JointGraph("joint");
        this.neighborUtils = new NeighborUtils(this.graph.graph, this.$store);
        this.centerGraph();

        window.addEventListener("resize", this.centerGraph);
    },
    unmounted(): void {
        window.removeEventListener("resize", this.centerGraph);
    },
    methods: {
        /**
         * Load graph
         */
        graphLoaded(): void {
            const neighbors = this.$store.state.inventory.neighbors;
            const relations = this.$store.state.inventory.relations;

            // Clear previous graph + settings
            if (Object.keys(this.selectedNodeShape).length !== 0) this.graph.graph.clear();
            this.neighborUtils.resetGraphPositioning();

            // Display origin, neighbors and relations
            if (this.selectedNode) this.displaySelectedNode(this.selectedNode as ApiNode);
            this.neighborUtils.setStepDistance(neighbors.length);
            this.addNeighborNodesAndRelations(neighbors, relations);
        },
        /**
         * Check if a node from the overview list was dropped
         */
        // eslint-disable-next-line
        onNodeDrop(): void {
            // Get the selected node
            const node = this.$store.state.inventory.selectedNode;
            if (!node) return;
        },
        /**
         * Displays the node in the neighbor view
         */
        displaySelectedNode(apiNode: ApiNode) {
            const shape = this.neighborUtils.addNodeToDiagram(apiNode);
            this.selectedNodeShape = shape;

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

            // Split overlapping relations
            for (const shape of this.graph.graph.getElements()) this.graph.adjustSiblingRelations(shape, true);
        },
        /**
         * Centers the graph
         */
        centerGraph(): void {
            const area = this.graph.paper.getArea();
            const xMiddle = area.x + area.width / 2;
            const yMiddle = area.y + area.height / 2;

            const translate = this.graph.paper.translate();
            const scale = this.graph.paper.scale();

            this.graph.paper.translate(translate.tx + xMiddle * scale.sx, translate.ty + yMiddle * scale.sy);
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
