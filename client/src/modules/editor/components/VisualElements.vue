<template>
    <div>
        <div class="underlined-title">
            {{ $t("editor.visualElements.title") }}
        </div>
        <div class="visual-items">
            <div
                v-for="shape in shapes"
                :key="shape"
                class="visual-item"
                draggable="true"
                @dragstart="onNodeDrag(shape, $event)"
            >
                <svg>
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#${shape}`"></use>
                </svg>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { NodeShapes } from "@/shared/NodeShapes";
import { NodeDrag } from "@/shared/NodeDrag";

export default defineComponent({
    name: "VisualElements",
    data() {
        return {
            shapes: NodeShapes,
        };
    },
    methods: {
        /**
         * Start dragging in a new node
         */
        onNodeDrag(shape: string, evt: DragEvent): void {
            this.$store.commit("editor/setDraggedNode", {
                evt,
                name: "text",
                color: "#FFF",
                borderColor: "#333",
                shape,
                nodeId: "",
                label: "",
            } as NodeDrag);
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.underlined-title {
    border-color: @dark;
    padding: 8px 0;
    height: auto;
    margin-top: 12px;
}

.visual-items {
    padding: 12px 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
}

.visual-item {
    cursor: grab;
    padding: 16px;
    border-radius: @border_radius;
    border: 2px solid @grey;
    display: flex;

    svg {
        fill: @dark;
        width: 48px;
        height: 48px;
    }
}
</style>
