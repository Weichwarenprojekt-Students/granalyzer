<template>
    <div class="content">
        <div class="title">Node Overview</div>
        <label class="searchbar">
            <input type="text" placeholder="Search..." />
        </label>
        <ScrollPanel class="scroll-panel">
            <OverviewItem
                v-for="content in nodes"
                :key="content.id"
                :name="content.name"
                :label="content.label"
                :attribtues="content.attributes"
                :nodeId="content.id"
                :color="labelColor.get(content.label).color"
                :font-color="labelColor.get(content.label).fontColor"
            />
            <div class="space"></div>
        </ScrollPanel>
        <!--<div class="button">Add Node</div>-->
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import OverviewItem from "@/modules/editor/modules/overview-list/components/OverviewItem.vue";

export default defineComponent({
    name: "OverviewList",
    components: { OverviewItem },
    props: {
        // Nodes to be displayed in the overview
        nodes: Array,
        // Background colors and color fonts for the nodes
        labelColor: Object,
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.content {
    height: 100%;
    border-right: 1px solid @grey;
    padding: 0 16px;

    display: flex;
    flex-flow: column;
}

.title {
    flex: 0 0 auto;

    font-size: @h2;
    display: flex;
    align-items: center;
    border-bottom: 2px solid @primary_color;

    height: 64px;
}

.searchbar {
    flex: 0 0 auto;
    margin-top: 8px;
}

.scroll-panel {
    margin-top: 8px !important;
    overflow: hidden !important;
    flex: 1 1 auto !important;

    .space {
        height: 20px;
    }
}

.button {
    width: 128px;
    height: 40px;
    font-size: @h3;
    padding-right: 8px;

    position: absolute;
    bottom: 16px;
    right: 16px;

    border: 1px solid @dark;
}
</style>
