<template>
    <!-- The extra divs are necessary for the tooltips to work -->
    <div class="toolbar-container">
        <!-- Relation Edit Mode -->
        <div
            :class="[
                'item-relation-mode',
                $store.state.editor.graphEditor.relationModeActive ? 'selected' : '',
                disabled ? 'item-disabled' : '',
            ]"
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

        <!-- Add Related Nodes -->
        <div
            :class="['item', canAddNeighbors && !disabled ? '' : 'item-disabled']"
            v-tooltip.bottom="
                $t('editor.toolbar.related', { amount: $store.state.editor.graphEditor.relatedNodesAmount })
            "
            @click="addRelatedNodes"
        >
            <svg class="icon">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#bold-diagram`"></use>
            </svg>
            <p v-if="isNode" class="related-nodes-number">
                {{ $store.state.editor.graphEditor.relatedNodesAmount }}
            </p>
        </div>

        <!-- To Front -->
        <div
            :class="['item', $store.getters['editor/itemSelected'] && !disabled ? '' : 'item-disabled']"
            @click="toFront"
            v-tooltip.bottom="$t('editor.toolbar.front')"
        >
            <svg class="icon">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#to-front`"></use>
            </svg>
        </div>

        <!-- To Back -->
        <div
            :class="['item', $store.getters['editor/itemSelected'] && !disabled ? '' : 'item-disabled']"
            @click="toBack"
            v-tooltip.bottom="$t('editor.toolbar.back')"
        >
            <svg class="icon">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#to-back`"></use>
            </svg>
        </div>

        <!-- Center -->
        <div
            :class="['item', disabled ? 'item-disabled' : '']"
            v-tooltip.bottom="$t('editor.toolbar.center')"
            @click="centerContent"
        >
            <svg class="icon">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#center`"></use>
            </svg>
        </div>

        <!-- Undo -->
        <div
            :class="['item', $store.getters['editor/undoAvailable'] && !disabled ? '' : 'item-disabled']"
            @click="undo"
            v-tooltip.bottom="$t('editor.toolbar.undo')"
        >
            <svg class="icon">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#undo`"></use>
            </svg>
        </div>

        <!-- Redo -->
        <div
            :class="['item', $store.getters['editor/redoAvailable'] && !disabled ? '' : 'item-disabled']"
            @click="redo"
            v-tooltip.bottom="$t('editor.toolbar.redo')"
        >
            <svg class="icon">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#redo`"></use>
            </svg>
        </div>

        <!-- Trash -->
        <div
            :class="['item', $store.getters['editor/itemSelected'] && !disabled ? '' : 'item-disabled']"
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
    props: {
        disabled: Boolean,
    },
    mounted(): void {
        window.addEventListener("keydown", this.handleKeys);
        (document.activeElement as HTMLElement).blur();
    },
    unmounted(): void {
        window.removeEventListener("keydown", this.handleKeys);
    },
    methods: {
        /**
         * Handle the key events
         */
        handleKeys(e: KeyboardEvent): void {
            // Check if some input or something else is currently selected
            if (document.activeElement !== document.body) return;

            // Toolbar is disabled
            if (this.disabled) return;

            // Find the right shortcut
            if (e.key == "r") this.toggleRelationMode();
            else if (e.key == "a" && this.canAddNeighbors) this.addRelatedNodes();
            else if (e.key == "f" && this.$store.getters["editor/itemSelected"]) this.toFront();
            else if (e.key == "b" && this.$store.getters["editor/itemSelected"]) this.toBack();
            else if (e.key == "c") this.centerContent();
            else if (e.key == "z" && e.ctrlKey && this.$store.getters["editor/undoAvailable"]) this.undo();
            else if (e.key == "y" && e.ctrlKey && this.$store.getters["editor/redoAvailable"]) this.redo();
            else if (e.key == "Delete" && this.$store.getters["editor/itemSelected"]) this.remove();
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
    computed: {
        /**
         * @return True if the currently selected node has neighbors to add
         */
        canAddNeighbors(): boolean {
            return this.isNode && this.$store.state.editor.graphEditor.relatedNodesAmount > 0;
        },
        /**
         * @return True if the currently selected element is a node
         */
        isNode(): boolean {
            return (
                this.$store.getters["editor/itemSelected"] &&
                this.$store.state.editor.graphEditor.selectedElement?.isNode()
            );
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
        bottom: 6px;
        right: 10px;
        border-radius: 4px;
        background: @dark;
        color: white;
        padding: 1px 4px 0 4px;
        font-size: 9px;
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

    .related-nodes-number {
        background: @dark_accent;
    }
}
</style>
