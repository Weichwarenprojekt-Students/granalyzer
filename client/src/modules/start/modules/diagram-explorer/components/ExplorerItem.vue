<template>
    <div
        :class="['diagram-item', { selected: isSelected }]"
        draggable="true"
        @dragstart="startDrag($event, title)"
        @dragend="endDrag($event, title)"
        @dragenter="dragEnter($event, title)"
        @dragleave.self="dragLeave($event, title)"
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
            const target = evt.currentTarget;
            setTimeout(() => (target.style.display = "none"), 0.5);
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
            evt.currentTarget.style.display = "block";
        },
    },
});
</script>

<style lang="less" scoped>
@import "../../../../../styles/global";

.drag-over {
    background: @accent_color;
}

.selected {
    background: @secondary_color;
}

.diagram-item {
    margin-right: 32px;
    cursor: pointer;
    padding: 16px;
    transition: auto 400ms;

    &:hover {
        background: @accent_color;
    }

    img {
        width: 100px;
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
