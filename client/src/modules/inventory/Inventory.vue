<template>
    <div class="content">
        <OverviewList
            :nodesReady="$store.getters['nodesReady']"
            :nodes="$store.state.nodes"
            :labels="$store.state.labels"
            :labelColors="$store.state.labelColor"
            :toggleScrollEmit="toggleScrollEmit"
            :selectedItemId="$store.state.inventory.selectedNode?.nodeId"
            class="overview"
            @extend-nodes="extendNodes"
            @clicked-on-node="clickedOnNode"
            @user-filter="handleFilter"
        ></OverviewList>
        <div class="center">
            <InventoryHeader class="header"></InventoryHeader>
            <NeighborView class="editor" :selectedNode="$store.state.inventory.selectedNode"></NeighborView>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import OverviewList from "@/components/overview-list/OverviewList.vue";
import InventoryHeader from "@/modules/inventory/modules/inventory-header/InventoryHeader.vue";
import NeighborView from "@/modules/inventory/modules/neighbor-view/NeighborView.vue";
import ApiNode from "@/modules/editor/models/ApiNode";

export default defineComponent({
    name: "Inventory",
    components: {
        OverviewList,
        NeighborView,
        InventoryHeader,
    },
    data() {
        return {
            // Toggle reloading of nodes for the overview list
            toggleScrollEmit: true,
            // Filter for node reloading
            filter: {
                // Input in the searchbar
                userInput: "",
                // Labels to filter by
                labelsToFilterBy: [] as Array<string>,
            },
        };
    },
    mounted() {
        // Load the labels with the first load of matching nodes
        this.$store.dispatch("loadLabelsAndNodes");
    },
    methods: {
        /**
         * Extend the node list
         */
        async extendNodes(): Promise<void> {
            await this.$store.dispatch("extendNodes", this.filter);
            this.toggleScrollEmit = !this.toggleScrollEmit;
        },
        /**
         * Store node that was selected
         */
        clickedOnNode(node: ApiNode): void {
            if (this.$store.state.inventory.selectedNode?.nodeId === node.nodeId) return;

            this.$store.commit("inventory/setSelectedNode", node);
        },
        /**
         * Filter nodes by labels
         */
        handleFilter(filter: { userInput: string; labelsToFilterBy: Array<string> }): void {
            this.filter.userInput = filter.userInput;
            this.filter.labelsToFilterBy = filter.labelsToFilterBy;

            this.$store.dispatch("loadLabelsAndNodes", filter);
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.content {
    width: 100%;
    height: 100%;
    background: @light_grey;
    display: flex;
}

.overview {
    width: @inventory_width;
    height: 100vh;
    flex: 0 0 auto;
    background: white;
}

.center {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
}

.header {
    width: 100%;
    height: @header-height;
    background: white;
    flex: 0 0 auto;
}

.editor {
    flex: 1 1 auto;
}
</style>
