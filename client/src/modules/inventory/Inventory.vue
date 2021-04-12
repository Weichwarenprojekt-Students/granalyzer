<template>
    <div class="content">
        <OverviewList
            :nodesReady="$store.getters['inventory/nodesReady']"
            :nodes="$store.state.inventory.nodes"
            :labels="$store.state.inventory.labels"
            :labelColors="$store.state.inventory.labelColor"
            :toggleScrollEmit="toggleScrollEmit"
            :selectedItemId="$store.state.inventory.selectedNode?.id"
            class="overview"
            @extend-nodes="extendNodes"
            @clicked-on-node="clickedOnNode"
            @user-filter="handleFilter"
        ></OverviewList>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import OverviewList from "@/components/overview-list/OverviewList.vue";
import ApiNode from "@/modules/editor/models/ApiNode";

export default defineComponent({
    name: "Inventory",
    components: {
        OverviewList,
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
        this.$store.dispatch("inventory/loadLabelsAndNodes");
    },
    methods: {
        /**
         * Extend the node list
         */
        async extendNodes(): Promise<void> {
            await this.$store.dispatch("inventory/extendNodes", this.filter);
            this.toggleScrollEmit = !this.toggleScrollEmit;
        },
        /**
         * Store node that was selected
         */
        clickedOnNode(node: ApiNode): void {
            this.$store.commit("inventory/setSelectedNode", node);
        },
        /**
         * Filter nodes by labels
         */
        handleFilter(filter: { userInput: string; labelsToFilterBy: Array<string> }): void {
            this.filter.userInput = filter.userInput;
            this.filter.labelsToFilterBy = filter.labelsToFilterBy;

            this.$store.dispatch("inventory/loadLabelsAndNodes", filter);
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
    position: relative;

    .overview {
        width: @inventory_width;
        height: 100vh;
        position: relative;
        background: white;
    }
}
</style>
