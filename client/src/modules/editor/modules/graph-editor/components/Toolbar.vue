<template>
    <!-- The extra divs are necessary for the tooltips to work -->
    <div class="toolbar-container">
        <!-- Relation Edit Mode -->
        <div
            :class="['item-relation-mode', $store.state.editor.graphEditor.relationModeActive ? 'selected' : '']"
            v-tooltip.bottom="$t('editor.toolbar.relation')"
            @click="toggleRelationMode"
        >
            <svg class="icon">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#relation`"></use>
            </svg>
            <span class="addon" v-show="$store.state.editor.graphEditor.relationModeActive">
                {{ $t("editor.toolbar.active") }}
            </span>
        </div>
        <div
            :class="['item', $store.getters['editor/itemSelected'] ? '' : 'item-disabled']"
            v-tooltip.bottom="
                $t('editor.toolbar.related', { amount: $store.state.editor.graphEditor.relatedNodesAmount })
            "
            @click="addRelatedNodes"
        >
            <svg class="icon">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#bold-diagram`"></use>
            </svg>
            <p v-if="$store.getters['editor/itemSelected']" class="related-nodes-number">
                {{ $store.state.editor.graphEditor.relatedNodesAmount }}
            </p>
        </div>
        <div
            :class="['item', $store.getters['editor/itemSelected'] ? '' : 'item-disabled']"
            @click="toFront"
            v-tooltip.bottom="$t('editor.toolbar.front')"
        >
            <svg class="icon">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#to-front`"></use>
            </svg>
        </div>
        <div
            :class="['item', $store.getters['editor/itemSelected'] ? '' : 'item-disabled']"
            @click="toBack"
            v-tooltip.bottom="$t('editor.toolbar.back')"
        >
            <svg class="icon">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#to-back`"></use>
            </svg>
        </div>

        <!-- Center -->
        <div :class="['item']" v-tooltip.bottom="$t('editor.toolbar.center')" @click="centerContent">
            <svg class="icon">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#center`"></use>
            </svg>
        </div>

        <!-- Undo -->
        <div
            :class="['item', $store.getters['editor/undoAvailable'] ? '' : 'item-disabled']"
            @click="undo"
            v-tooltip.bottom="$t('editor.toolbar.undo')"
        >
            <svg class="icon">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#undo`"></use>
            </svg>
        </div>

        <!-- Redo -->
        <div
            :class="['item', $store.getters['editor/redoAvailable'] ? '' : 'item-disabled']"
            @click="redo"
            v-tooltip.bottom="$t('editor.toolbar.redo')"
        >
            <svg class="icon">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#redo`"></use>
            </svg>
        </div>

        <!-- Trash -->
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
            else if (e.key == "r") this.toggleRelationMode();
            else if (e.key == "c") this.centerContent();
        },
        /**
         * Remove the last selected node
         */
        remove(): void {
            this.$store.dispatch("editor/removeNode");
        },
        /**
         * Capture the content of the diagram
         */
        centerContent(): void {
            this.$store.commit("editor/centerContent");
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
        /**
         * Toggle the relation edit mode
         */
        toggleRelationMode(): void {
            this.$store.dispatch("editor/toggleRelationMode");
        },
        /**
         * Add related nodes to last selected node
         */
        addRelatedNodes(): void {
            this.$store.dispatch("editor/addRelatedNodes");
            this.$store.dispatch("editor/updateRelatedNodesCount");
        },
        /**
         * Bring selected element to the front
         */
        toFront(): void {
            this.$store.dispatch("editor/addZIndexCommand", true);
        },
        /**
         * Bring selected element to the back
         */
        toBack(): void {
            this.$store.dispatch("editor/addZIndexCommand", false);
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.toolbar-container {
    display: flex;
    background: white;
    border-radius: @border_radius;
    position: absolute;
    top: 16px;
    right: 16px;

    user-select: none;
}

.item {
    position: relative;

    height: 40px;
    width: 48px;
    cursor: pointer;
    border-radius: @border_radius;

    &:hover {
        background: @accent_color;

        .related-nodes-number {
            background: @accent_color;
        }
    }

    svg {
        width: 48px;
        height: 40px;
        padding: 8px 0;
    }

    &.selected {
        background: @secondary_color;

        &:hover {
            background: @secondary_color;
        }
    }

    .related-nodes-number {
        position: absolute;
        bottom: 2px;
        right: 2px;
        border-radius: 2px;
        background: #fff;
        padding: 0 2px 0 2px;
        font-size: 12px;
        min-width: 20px;
        text-align: center;
    }
}

.item-relation-mode {
    .item();
    width: auto;
    min-width: 48px;
    display: flex;

    .addon {
        line-height: 40px;
        padding-right: 8px;
        width: auto;
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
