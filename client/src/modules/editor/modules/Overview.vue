<template>
    <div class="content">
        <div class="title">Inventory</div>
        <label class="searchbar">
            <input type="text" placeholder="Search..." />
        </label>
        <ScrollPanel class="scroll-panel">
            <OverviewItem v-for="node in mockNodes" :key="node" :label="node"></OverviewItem>
        </ScrollPanel>
        <!--<div class="button">Add Node</div>-->
    </div>
</template>

<script>
import { defineComponent } from "vue";
import OverviewItem from "@/modules/editor/modules/components/OverviewItem";

export default defineComponent({
    name: "Overview",
    components: { OverviewItem },
    data() {
        return {
            mockNodes: ["Node1", "Node2", "Node3"],
        };
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/styles.less";

.content {
    height: 100%;
    border-left: 1px solid @grey;
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
    padding: 0 8px;

    height: 64px;
}

.searchbar {
    flex: 0 0 auto;

    display: flex;
    align-items: center;
    padding: 0 16px;
    margin-top: 8px;
    background: @light_grey;
    height: 48px;

    input[type="text"] {
        width: 100%;
        font-size: @h3;
        background: transparent;
        border: none;
    }
}

.scroll-panel {
    margin-top: 8px !important;
    overflow: hidden !important;
    flex: 1 1 auto !important;
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
