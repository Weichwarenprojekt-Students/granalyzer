<template>
    <div class="inventory">
        <CollapsablePanel :left="true">
            <OverviewList
                :selectedItemId="$store.state.inventory.selectedNode?.nodeId"
                :create="true"
                @on-node-clicked="onNodeClicked"
                @on-node-drag="onNodeDrag"
            ></OverviewList>
        </CollapsablePanel>
        <div class="center">
            <InventoryHeader class="header"></InventoryHeader>
            <NeighborView class="editor" :selectedNode="$store.state.inventory.selectedNode"></NeighborView>
        </div>
        <CollapsablePanel :left="false">
            <WriteInspector class="inspector" />
        </CollapsablePanel>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import OverviewList from "@/modules/overview-list/OverviewList.vue";
import InventoryHeader from "@/modules/inventory/components/InventoryHeader.vue";
import NeighborView from "@/modules/inventory/modules/neighbor-view/NeighborView.vue";
import ApiNode from "@/models/data-scheme/ApiNode";
import WriteInspector from "@/modules/inspector/WriteInspector.vue";
import { NodeDrag } from "@/shared/NodeDrag";
import { NodeFilter } from "@/modules/overview-list/models/NodeFilter";
import CollapsablePanel from "@/components/CollapsablePanel.vue";

export default defineComponent({
    name: "Inventory",
    components: {
        CollapsablePanel,
        WriteInspector,
        OverviewList,
        NeighborView,
        InventoryHeader,
    },
    beforeCreate() {
        // Load the labels with the first load of matching nodes
        this.$store.commit("overview/updateFilter", new NodeFilter());
        this.$store.dispatch("overview/loadLabelsAndNodes");

        // Restore last selection if revisiting
        if (this.$store.state.inventory.selectedNode) {
            this.$store.dispatch("inventory/loadNeighbors", this.$store.state.inventory.selectedNode);
            this.$store.dispatch("inspector/selectNode", this.$store.state.inventory.selectedNode.nodeId);
        }
    },
    methods: {
        /**
         * Store node that was selected
         */
        onNodeClicked(node: ApiNode): void {
            if (this.$store.state.inventory.selectedNode?.nodeId === node.nodeId || this.$store.state.inventory.loading)
                return;
            this.$store.dispatch("inspector/selectNode", node.nodeId);
            this.$store.commit("inventory/setSelectedNode", node);
        },
        /**
         * Store dragged node
         */
        onNodeDrag(node: NodeDrag): void {
            this.$store.commit("inventory/setDraggedNode", node);
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.inventory {
    overflow: hidden;
    width: 100%;
    height: 100%;
    background: @light_grey;
    display: flex;
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
