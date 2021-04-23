<template>
    <div class="container" @mousemove="graph.mousemove">
        <!-- Info, when empty -->
        <div v-show="!$store.state.inventory.selectedNode" class="empty-warning">
            <svg>
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#info`"></use>
            </svg>
            <div class="message">{{ $t("inventory.graph.emptySelection") }}</div>
        </div>

        <!-- Neighbor preview graph -->
        <div id="joint" @dragover.prevent @drop="nodeDrop" />

        <!-- Dialog for adding new relations -->
        <DropdownDialog
            @input-confirm="addNewRelation"
            @cancel="showDialog = false"
            :show="showDialog"
            :fromNode="fromNode"
            :toNodes="toNodes"
        ></DropdownDialog>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { JointGraph } from "@/shared/JointGraph";
import ApiNode from "@/models/data-scheme/ApiNode";
import { GraphUtils } from "@/modules/inventory/modules/neighbor-view/controls/GraphUtils";
import ApiRelation from "@/models/data-scheme/ApiRelation";
import DropdownDialog from "@/modules/inventory/modules/neighbor-view/components/DropdownDialog.vue";

export default defineComponent({
    name: "NeighborView",
    components: { DropdownDialog },
    props: {
        // Currently selected node in the overview list
        selectedNode: Object,
    },
    data() {
        return {
            // Graph of the inventory view
            graph: {} as JointGraph,
            // Utility functions for the neighbor view
            graphUtils: {} as GraphUtils,
            // True if the dialog is visible
            showDialog: false,
            // Node the relation comes from
            fromNode: {} as ApiNode,
            // Node the relation goes to
            toNodes: [] as Array<ApiNode>,
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
        this.graph = new JointGraph("joint");
        this.graphUtils = new GraphUtils(this.graph, this.$store);
        this.graphUtils.centerGraph();

        this.$store.commit("inventory/setGraphUtils", this.graphUtils);

        window.addEventListener("resize", () => this.graphUtils.centerGraph());
    },
    unmounted(): void {
        window.removeEventListener("resize", () => this.graphUtils.centerGraph());
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
            this.graphUtils.setStepDistance(neighbors.length);
            this.addNeighborNodesAndRelations(neighbors, relations);
        },
        /**
         * Displays the node in the neighbor view
         */
        displaySelectedNode(apiNode: ApiNode): void {
            const shape = this.graphUtils.addNodeToDiagram(apiNode);
            shape.attr("body/strokeWidth", 0);
        },
        /**
         * Adds nodes and neighbors to the neighbor relation diagram
         */
        addNeighborNodesAndRelations(neighbors: ApiNode[], relations: ApiRelation[]): void {
            // Neighbor nodes
            for (const apiNode of neighbors) this.graphUtils.addNodeToDiagram(apiNode);

            // Neighbor relations
            for (const apiRelation of relations) this.graphUtils.addRelationToDiagram(apiRelation);

            // Split overlapping relations
            for (const shape of this.graph.graph.getElements()) this.graph.rearrangeOverlappingRelations(shape, false);
        },
        /**
         * Clears the previous graph + settings
         */
        clearGraphAndSettings(): void {
            this.graphUtils.resetNeighborPlacement();
            this.graphUtils.resetGraph();
            this.graphUtils.centerGraph();
        },
        /**
         * Dropping of a node into the preview
         */
        nodeDrop(): void {
            if (!this.selectedNode || this.$store.state.inventory.loading) return;

            const toNodes = new Array<ApiNode>();
            toNodes.push(...this.$store.state.inventory.neighbors, this.selectedNode as ApiNode);

            this.fromNode = this.$store.state.inventory.draggedNode as ApiNode;
            this.toNodes = toNodes;
            this.showDialog = true;
        },
        /**
         * Adds a new relation after dialog confirmation
         */
        async addNewRelation(payload: { selectedRelationType: string; from: ApiNode; to: ApiNode }): Promise<void> {
            this.showDialog = false;

            await this.$store.dispatch("inventory/addNewRelation", {
                from: payload.from.nodeId,
                to: payload.to.nodeId,
                type: payload.selectedRelationType,
            });

            this.$store.dispatch("inventory/loadRelations", this.selectedNode);
            this.graphLoaded();
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
