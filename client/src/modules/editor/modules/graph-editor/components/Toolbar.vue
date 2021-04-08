<template>
    <!-- The extra divs are necessary for the tooltips to work -->
    <div class="container">
        <div
            :class="['item', $store.getters['editor/undoAvailable'] ? '' : 'item-disabled']"
            @click="undo"
            v-tooltip.bottom="$t('editor.toolbar.undo')"
        >
            <svg class="icon">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#undo`"></use>
            </svg>
        </div>
        <div
            :class="['item', $store.getters['editor/redoAvailable'] ? '' : 'item-disabled']"
            @click="redo"
            v-tooltip.bottom="$t('editor.toolbar.redo')"
        >
            <svg class="icon">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#redo`"></use>
            </svg>
        </div>
        <div
            :class="['item', $store.getters['editor/itemSelected'] ? '' : 'item-disabled']"
            @click="remove"
            v-tooltip.bottom="$t('editor.toolbar.delete')"
        >
            <svg class="icon">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#trash`"></use>
            </svg>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "Toolbar",
    mounted(): void {
        window.addEventListener("keydown", this.handleKeys);
    },
    unmounted(): void {
        window.removeEventListener("keydown", this.handleKeys);
    },
    methods: {
        /**
         * Handle the key events
         */
        handleKeys(e: KeyboardEvent): void {
            if (e.key == "Delete" && this.$store.getters["editor/itemSelected"]) this.remove();
            else if (e.key == "z" && e.ctrlKey && this.$store.getters["editor/undoAvailable"]) this.undo();
            else if (e.key == "y" && e.ctrlKey && this.$store.getters["editor/redoAvailable"]) this.redo();
        },
        /**
         * Remove the last selected node
         */
        remove(): void {
            this.$store.dispatch("editor/removeNode");
        },
        /**
         * Start an undo action
         */
        undo(): void {
            this.$store.dispatch("editor/undo");
        },
        /**
         * Start a redo action
         */
        redo(): void {
            this.$store.dispatch("editor/redo");
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.container {
    display: flex;
    background: white;
    border-radius: @border_radius;
    position: absolute;
    top: 16px;
    right: 16px;
}

.item {
    height: 40px;

    svg {
        width: 48px;
        height: 40px;
        padding: 8px 0;
        cursor: pointer;
        border-radius: @border_radius;

        &:hover {
            background: @accent_color;
        }
    }
}

.item-disabled {
    pointer-events: none;

    svg {
        fill: @dark_accent;

        &:hover {
            background: transparent;
        }
    }
}
</style>
