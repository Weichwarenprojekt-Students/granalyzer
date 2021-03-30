<template>
    <!-- Labels -->
    <div class="label" :id="content.label" @click="onClick($event)" @dblclick="onDblClick($event)">
        {{ content.label }}
    </div>

    <!-- Nodes related to the label -->
    <div
        class="label node"
        :id="node.id"
        v-for="node in content.nodes"
        :key="node"
        @click="onClick($event)"
        @dblclick="onDblClick($event)"
        draggable="true"
        @dragstart="startDrag"
        @dragend="endDrag"
    >
        {{ node.name }}
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "OverviewItem",
    props: {
        // Labels and nodes of the customer db
        content: Object,
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
            evt.dataTransfer.setData("overview-drag", evt.currentTarget.id);

            // Create custom ghost-element
            const ghostElement = evt.currentTarget.cloneNode(true);
            ghostElement.classList.add("dragged");

            // Set color to label color
            ghostElement.style.background = this.content.color;
            document.body.appendChild(ghostElement);

            // Set ghost image for dragging
            evt.dataTransfer.setDragImage(ghostElement, 0, 0);

            // Remove ghost-element from the html
            setTimeout(() => {
                ghostElement.parentNode.removeChild(ghostElement);
            }, 100);
        },
        /**
         * Event function when cancelling a drag operation
         */
        // eslint-disable-next-line
        endDrag(evt: any): void {
            console.log(evt);
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/styles.less";

.label {
    height: 60px;
    padding-left: 16px;
    display: flex;
    align-items: center;
    font-size: @h3;
    border-bottom: 1px solid @grey;
    cursor: pointer;

    &:hover {
        background: @accent_color;
    }
}

.node {
    font-size: @h3 - 2px;
    padding-left: 32px;
}

.selected {
    background: @secondary_color;

    &:hover {
        background: @secondary_color;
    }
}

.dragged {
    border: 1px solid @grey;
    border-radius: 5px;
    padding: 0;
    width: 128px;
    display: flex;
    justify-content: center;
}
</style>
