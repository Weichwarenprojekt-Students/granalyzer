<template>
    <div class="content">
        <OverviewList
            :selectedItemId="$store.state.inventory.selectedNode?.nodeId"
            class="overview"
            @clicked-on-node="clickedOnNode"
        ></OverviewList>
        <div class="center">
            <InventoryHeader class="header"></InventoryHeader>
            <NeighborView class="editor" :selectedNode="$store.state.inventory.selectedNode"></NeighborView>
        </div>
        <WriteInspector class="inspector" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import OverviewList from "@/modules/overview-list/OverviewList.vue";
import InventoryHeader from "@/modules/inventory/modules/inventory-header/InventoryHeader.vue";
import NeighborView from "@/modules/inventory/modules/neighbor-view/NeighborView.vue";
import ApiNode from "@/models/data-scheme/ApiNode";
import WriteInspector from "@/modules/inspector/WriteInspector.vue";

export default defineComponent({
    name: "Inventory",
    components: {
        WriteInspector,
        OverviewList,
        NeighborView,
        InventoryHeader,
    },
    mounted() {
        // Load the labels with the first load of matching nodes
        this.$store.dispatch("overview/loadLabelsAndNodes");
    },
    methods: {
        /**
         * Store node that was selected
         */
        clickedOnNode(node: ApiNode): void {
            if (this.$store.state.inventory.selectedNode?.nodeId === node.nodeId || this.$store.state.inventory.loading)
                return;

            this.$store.commit("inventory/setSelectedNode", node);
            this.$store.dispatch("inventory/loadRelations", node);
            this.$store.dispatch("inspector/selectNode", node.nodeId);
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

.inspector {
    width: @inspector_width;
    height: 100vh;
    flex: 0 0 auto;
    background: white;
}
</style>
