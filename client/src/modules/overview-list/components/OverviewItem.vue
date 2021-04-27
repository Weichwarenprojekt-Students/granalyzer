<template>
    <!-- Nodes related to the label -->
    <div :class="['node', { selected: isSelected }]" @mouseup="onNodeClicked" draggable="true" @dragstart="onNodeDrag">
        <p>{{ node.name }}</p>
        <div class="label" :style="{ background: color, color: fontColor }">
            {{ node.label }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ApiNode from "@/models/data-scheme/ApiNode";
import { NodeDrag } from "@/shared/NodeDrag";
import { NodeShapes } from "@/shared/NodeShapes";

export default defineComponent({
    name: "OverviewItem",
    props: {
        node: {
            type: Object,
            default: new ApiNode(),
        },
        color: String,
        fontColor: String,
        isSelected: Boolean,
    },
    methods: {
        /**
         * Handles click event on an item in the node overview
         */
        async onNodeClicked() {
            this.$emit("on-node-clicked", { ...this.node, color: this.color });
        },
        /**
         * Event function to start dragging elements
         */
        onNodeDrag(evt: DragEvent): void {
            this.$emit(
                "on-node-drag",
                new NodeDrag(evt, this.node.name, this.color, NodeShapes.RECTANGLE, this.node.nodeId, this.node.label),
            );
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.node {
    padding: 12px 24px 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid @grey;
    cursor: pointer;

    .label {
        font-size: @description;
        padding: 4px 8px;
        border-radius: @border_radius;
    }

    &:hover {
        background: @accent_color;
    }
}

.selected {
    background: @secondary_color;

    &:hover {
        background: @secondary_color;
    }
}
</style>
