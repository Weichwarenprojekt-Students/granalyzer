<template>
    <div
        :class="['diagram-item', { selected: isSelected }]"
        draggable="true"
        @dragstart="startDrag"
        @dragend="endDrag"
        @dragenter="dragEnter"
        @dragleave="dragLeave"
        @drop="drop"
    >
        <img :src="imageSrc" alt="Explorer Item" draggable="false" />
        <p>{{ title }}</p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ItemDragEvent } from "../models/ItemDragEvent";

export default defineComponent({
    name: "ExplorerItem",
    props: {
        imageSrc: String,
        title: String,
        isSelected: Boolean,
        isFolder: Boolean,
        itemId: Number,
    },
    methods: {
        /**
         * Event function to start dragging elements
         */
        // eslint-disable-next-line
        startDrag(evt: any): void {
            evt.dataTransfer.setData("currentDragId", this.itemId);
            evt.dataTransfer.setData("isFolder", this.isFolder);

            // Timeout on hide class is necessary as it would also effect
            // the drag preview otherwise
            const target = evt.currentTarget;
            target.classList.add("dragged");
            setTimeout(() => target.classList.add("dragged-hide"), 0);
        },
        /**
         * Event function when cancelling a drag operation
         */
        // eslint-disable-next-line
        endDrag(evt: any): void {
            evt.currentTarget.classList.remove("dragged-hide");
            evt.currentTarget.classList.remove("dragged");
        },
        /**
         * Event function when entering an element while dragging
         */
        // eslint-disable-next-line
        dragEnter(evt: any): void {
            if (!this.isFolder) return;
            evt.currentTarget.classList.add("drag-over");
        },
        /**
         * Event function when leaving an element while dragging
         */
        // eslint-disable-next-line
        dragLeave(evt: any): void {
            evt.currentTarget.classList.remove("drag-over");
        },
        /**
         * Event function when an element is dropped on this component
         */
        // eslint-disable-next-line
        drop(evt: any): void {
            // Get the transfer data
            const dragId = evt.dataTransfer.getData("currentDragId");
            const isFolder = evt.dataTransfer.getData("isFolder") == "true";

            // Remove the highlighting
            this.dragLeave(evt);

            // Check if the folder was dropped on itself
            if (dragId != this.itemId) {
                if (isFolder) {
                    this.$store.commit("start/deleteFolder", { id: dragId });
                    this.$emit("folder-drop", new ItemDragEvent(dragId, this.itemId));
                } else {
                    this.$store.commit("start/deleteDiagram", { id: dragId });
                    this.$emit("diagram-drop", new ItemDragEvent(dragId, this.itemId));
                }
            }
            return;
        },
    },
});
</script>

<style lang="less" scoped>
@import "../../../../../styles/global";

/**
 * This class will be set as soon as an element
 * is dragged. The width will be set to 0 and the
 * margin will simulate the full size of the element.
 * This is necessary for the CSS transition to work.
 */
.dragged {
    margin-right: 160px;
    background: white !important;
}

.dragged-hide {
    width: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    transition-duration: 400ms;

    p,
    img {
        display: none;
    }
}

.drag-over {
    background: @accent_color;
}

.selected {
    background: @secondary_color;
}

.diagram-item {
    margin-top: 16px;
    margin-right: 32px;
    cursor: pointer;
    padding: 16px;
    overflow: hidden;
    width: 128px;

    &:hover {
        background: @accent_color;
    }

    img {
        width: 100%;
        pointer-events: none;
    }

    p {
        text-align: center;
        margin-top: 16px;
        max-width: 100px;
        pointer-events: none;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}
</style>
