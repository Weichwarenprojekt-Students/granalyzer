<template>
    <!-- Nodes related to the label -->
    <div
        class="node"
        :id="nodeId"
        @click="onClick($event)"
        @dblclick="onDblClick($event)"
        draggable="true"
        @dragstart="startDrag($event)"
        @dragend="endDrag"
    >
        <h3>{{ name }}</h3>
        <div class="label" :style="{ background: color }">
            {{ label }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Node from "@/modules/editor/models/Node";

export default defineComponent({
    name: "OverviewItem",
    props: {
        // Labels and nodes of the customer db
        name: String,
        label: String,
        attributes: Array,
        nodeId: Number,
        color: String,
    },
    methods: {
        /**
         * Handles click event on an item in the node overview
         */
        // eslint-disable-next-line
        onClick(event: any) {
            const selectedId = this.$store.state.editor.selectedItemId;
            const eventId = event.currentTarget.id;

            // Deselect previously selected elements
            if (selectedId !== "") document.getElementById(selectedId)?.classList.remove("selected");

            // Deselect if selected item is clicked
            if (selectedId === eventId) {
                document.getElementById(selectedId)?.classList.remove("selected");
                this.$store.commit("editor/setSelectedItem", "");
                return;
            }

            // Toggle selection class and update store
            this.$store.commit("editor/setSelectedItem", eventId);
            event.currentTarget.classList.add("selected");
        },
        /**
         * Handles double click event on an item in the node overview
         */
        // eslint-disable-next-line
        onDblClick(event: any) {
            this.$store.commit("editor/setSelectedItem", event.currentTarget.id);
            event.currentTarget.classList.add("selected");
        },
        /**
         * Event function to start dragging elements
         */
        // eslint-disable-next-line
        startDrag(evt: any): void {
            // Set drag-id from overview
            evt.dataTransfer.setData("overview-drag", this.nodeId);

            // Store currently dragged item, so it can be replicated in the diagram

            if (this.name && this.label) {
                this.$store.commit(
                    "editor/setLastDragged",
                    new Node(this.name, this.label, this.attributes, this.nodeId, this.color),
                );
            }

            // Allow dragging into the diagram
            this.$store.commit("editor/setDragIntoDiagram", true);

            // Create custom ghost-element
            const ghostElement = evt.currentTarget.cloneNode(true);
            ghostElement.classList.add("dragged");

            // Set color to label color
            if (ghostElement) ghostElement.style.background = this.color;

            document.body.appendChild(ghostElement);

            // Set ghost image for dragging
            evt.dataTransfer.setDragImage(ghostElement, 0, 0);

            // Remove ghost-element from the html
            setTimeout(() => {
                ghostElement.parentNode.removeChild(ghostElement);
            }, 100);
        },
        /**
         * Event function that handles the cancel of a drag
         */
        //  eslint-disable-next-line
        endDrag(): void {
            setTimeout(() => {
                this.$store.commit("editor/setDragIntoDiagram", false);
            }, 50);
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/styles.less";

.node {
    height: 60px;
    padding: 0 24px 0 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid @grey;
    cursor: pointer;

    .label {
        padding: 4px 8px;
        border: 1px solid @grey;
        border-radius: 5px;
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
    border-radius: @border-radius;
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
