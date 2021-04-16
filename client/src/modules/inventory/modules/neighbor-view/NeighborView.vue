<template>
    <div class="container" @mousemove="graph.mousemove">
        <div v-show="!$store.state.inventory.selectedNode" class="empty-warning">
            <svg>
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#info`"></use>
            </svg>
            <div class="message">{{ $t("inventory.emptySelection") }}</div>
        </div>
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
         * Clear graph if there is no selection
         */
        selectedNode(newValue) {
            if (!newValue) this.clearGraphAndSettings();
        },
        /**
         * Display graph once all neighbors and relations are in the store
         */
        "$store.state.inventory.loading"(loading) {
            if (loading || !this.selectedNode) return;
            this.graphLoaded();
        },
    },
    mounted(): void {
        // Set up the graph and the controls
        this.graph = new JointGraph("joint", this.$store);
        this.neighborUtils = new NeighborUtils(this.graph, this.$store);
        this.centerGraph();
        this.$store.commit("inventory/setActive", true);

        window.addEventListener("resize", this.centerGraph);
    },
    unmounted(): void {
        this.$store.commit("inventory/setActive", false);
        window.removeEventListener("resize", this.centerGraph);
    },
    methods: {
        /**
         * Load graph
         */
        graphLoaded(): void {
            const neighbors = this.$store.state.inventory.neighbors;
            const relations = this.$store.state.inventory.relations;

            this.clearGraphAndSettings();

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
        displaySelectedNode(apiNode: ApiNode): void {
            const shape = this.neighborUtils.addNodeToDiagram(apiNode);
            this.selectedNodeShape = shape;

            shape.attr("body/strokeWidth", 0);
        },
        /**
         * Adds nodes and neighbors to the neighbor relation diagram
         */
        addNeighborNodesAndRelations(neighbors: ApiNode[], relations: ApiRelation[]): void {
            // Neighbor nodes
            for (const apiNode of neighbors) this.neighborUtils.addNodeToDiagram(apiNode);

            // Neighbor relations
            for (const apiRelation of relations) this.neighborUtils.addRelationToDiagram(apiRelation);

            // Split overlapping relations
            for (const shape of this.graph.graph.getElements()) this.graph.rearrangeOverlappingRelations(shape, false);
        },
        /**
         * Clears the previous graph + settings
         */
        clearGraphAndSettings(): void {
            if (Object.keys(this.selectedNodeShape).length !== 0) this.graph.graph.clear();
            this.neighborUtils.resetNeighborPlacement();
            this.centerGraph();
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

.empty-warning {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 18px;
    flex-direction: column;

    svg {
        fill: @dark_grey;
        height: 64px;
        width: 64px;
        margin-top: 128px;
        margin-bottom: 16px;
    }

    .message {
        color: @dark;
        font-size: @h3;
    }
}
</style>
