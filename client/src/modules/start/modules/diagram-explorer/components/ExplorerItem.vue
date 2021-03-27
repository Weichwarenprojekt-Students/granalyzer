<template>
    <div
        :class="['diagram-item', { selected: isSelected }]"
        draggable="true"
        @dragstart="startDrag($event, title)"
        @dragend="endDrag($event, title)"
        @dragenter="dragEnter($event, title)"
        @dragleave="dragLeave($event, title)"
        @drop="dragLeave($event, title)"
        :ref="title"
    >
        <img :src="imageSrc" alt="Explorer Item" draggable="false" />
        <p>{{ title }}</p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "ExplorerItem",
    props: {
        imageSrc: String,
        title: String,
        isSelected: Boolean,
        isFolder: Boolean,
    },
    methods: {
        /**
         * Event function to start dragging elements
         *
         * @param evt Type of MouseEvent
         * @param title Label of the div that is being dragged
         */
        // eslint-disable-next-line
        startDrag(evt: any, title: string): void {
            // Timeout on hide class is necessary as it would also effect
            // the drag preview otherwise
            const target = evt.currentTarget;
            target.classList.add("dragged");
            setTimeout(() => target.classList.add("dragged-hide"), 0);
        },
        /**
         * Event function when entering an element while dragging
         *
         * @param evt Type of MouseEvent
         * @param title Label of the div that is entered
         */
        // eslint-disable-next-line
        dragEnter(evt: any, title: string): void {
            if (!this.isFolder) return;
            evt.currentTarget.classList.add("drag-over");
        },
        /**
         * Event function when leaving an element while dragging
         *
         * @param evt Type of MouseEvent
         * @param title Label of the div that is left
         */
        // eslint-disable-next-line
        dragLeave(evt: any, title: string): void {
            evt.currentTarget.classList.remove("drag-over");
        },
        /**
         * Event function when cancelling a drag operation
         *
         * @param evt Type of MouseEvent
         * @param title Label of the div that is dragged
         */
        // eslint-disable-next-line
        endDrag(evt: any, title: string): void {
            evt.currentTarget.classList.remove("dragged-hide");
            evt.currentTarget.classList.remove("dragged");
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
    }
}
</style>
