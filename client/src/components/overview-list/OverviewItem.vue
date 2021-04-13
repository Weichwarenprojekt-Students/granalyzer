<template>
    <!-- Nodes related to the label -->
    <div
        :class="['node', { selected: isSelected }]"
        @mousedown="onClick($event)"
        draggable="true"
        @dragstart="startDrag($event)"
    >
        <p>{{ node.name }}</p>
        <div class="label" :style="{ background: color, color: fontColor }">
            {{ node.label }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ApiNode from "@/modules/editor/models/ApiNode";

export default defineComponent({
    name: "OverviewItem",
    emits: ["clicked-on-node"],
    props: {
        node: {
            type: Object,
            default: new ApiNode("", ""),
        },
        color: String,
        fontColor: String,
        isSelected: Boolean,
    },
    methods: {
        /**
         * Handles click event on an item in the node overview
         */
        onClick() {
            this.$emit("clicked-on-node", { ...this.node, color: this.color });
        },
        /**
         * Event function to start dragging elements
         */
        // eslint-disable-next-line
        startDrag(evt: any): void {
            // Create the ghost-element
            const ghostElement = evt.currentTarget.cloneNode(true);
            if (ghostElement) {
                ghostElement.style.background = this.color;
                ghostElement.classList.add("dragged");
            }
            // Set ghost image for dragging
            document.body.appendChild(ghostElement);
            evt.dataTransfer.setDragImage(ghostElement, 0, 0);
            // Remove ghost-element from the html
            setTimeout(() => ghostElement.parentNode.removeChild(ghostElement), 0);
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

.dragged {
    border-radius: @border_radius;
    width: fit-content;
    height: fit-content;
    padding: 8px 16px;
    display: flex;
    flex-direction: row;
    justify-content: center;

    .label {
        display: none;
    }
}
</style>
