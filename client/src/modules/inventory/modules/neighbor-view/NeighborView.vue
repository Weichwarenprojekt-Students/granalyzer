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
        <div id="joint" @dragover.prevent @drop="onNodeDrop" />

        <!-- Dialog for adding new relations -->
        <DropdownDialog
            @input-confirm="addNewRelation"
            @cancel="showDialog = false"
            :show="showDialog"
            :imageSrc="require('@/assets/img/icons.svg') + '#circle-plus'"
            :title="$t('inventory.dialog.title')"
            :relationTypes="dropdownRelationTypes"
        ></DropdownDialog>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { JointGraph } from "@/shared/JointGraph";
import ApiNode from "@/models/data-scheme/ApiNode";
import { dia } from "jointjs";
import { NeighborUtils } from "@/modules/inventory/modules/neighbor-view/controls/NeighborUtils";
import ApiRelation from "@/models/data-scheme/ApiRelation";
import DropdownDialog from "@/components/dialog/DropdownDialog.vue";

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
            // Root element that is currently displayed in the inventory
            selectedNodeShape: {} as dia.Element,
            // Utility functions for the neighbor view
            neighborUtils: {} as NeighborUtils,
            // True if the dialog is visible
            showDialog: false,
            // Relation types for the dropdown
            dropdownRelationTypes: [],
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
            this.neighborUtils.resetGraph();
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
        /**
         * Drop: Retrieve possible relation types
         */
        // eslint-disable-next-line
        async onNodeDrop(): Promise<void> {
            // Get the selected node
            const node = this.$store.state.inventory.selectedNode;
            if (!node || !this.selectedNode) return;

            this.dropdownRelationTypes = await this.$store.dispatch("inventory/getPossibleRelationTypes", {
                fromLabel: this.$store.state.inventory.draggedNode.label,
                toLabel: this.selectedNode.label,
            });

            this.showDialog = true;
        },
        /**
         * Adds a new relation after dialog confirmation
         */
        addNewRelation(selection: string): void {
            this.showDialog = false;

            this.$store.dispatch("inventory/addNewRelation", {
                from: this.$store.state.inventory.draggedNode.nodeId,
                to: (this.selectedNode as ApiNode).nodeId,
                type: selection,
            });

            // TODO :: Instead of reloading the entire neighbors/relations push the latest neighbor into the store
            // TODO >> and just reload the graph
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
