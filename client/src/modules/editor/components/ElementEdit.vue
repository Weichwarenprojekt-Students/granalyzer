<template>
    <div>
        <div class="underlined-title">
            {{ $t("editor.nodeEdit.title") }}
        </div>

        <!-- The node text -->
        <div :class="['attribute-item', { 'attribute-item-disabled': !isNode && !isRelation }]">
            <div class="attribute-key">
                {{ $t("editor.nodeEdit.text") }}
            </div>
            <input
                @change="changeStyle"
                v-model="elementStyle.name"
                class="input text-input"
                :placeholder="$t('global.input.placeholder')"
            />
        </div>

        <!-- The node shape -->
        <div :class="['attribute-item', { 'attribute-item-disabled': !isNode }]">
            <div class="attribute-key">
                {{ $t("editor.nodeEdit.shape") }}
            </div>
            <Dropdown
                :options="shapes"
                optionLabel="name"
                optionValue="value"
                v-model="elementStyle.shape"
                @change="changeShape"
                @hide="hide"
                :placeholder="$t('global.dropdown.choose')"
                :emptyMessage="$t('global.dropdown.empty')"
            />
        </div>

        <!-- The fill color -->
        <div :class="['attribute-item', { 'attribute-item-disabled': !isNode && !isRelation }]">
            <div class="attribute-key">
                <Checkbox @change="changeStyle" class="attribute-checkbox" v-model="colorEnabled" :binary="true" />
                <div :class="['attribute-key', { 'attribute-key-disabled': !colorEnabled }]">
                    {{ $t("editor.nodeEdit.color") }}
                </div>
            </div>
            <ColorPicker :disabled="!colorEnabled" @change="changeStyle" v-model="elementStyle.color" />
        </div>

        <!-- The border color -->
        <div :class="['attribute-item', { 'attribute-item-disabled': !isNode }]">
            <div class="attribute-key">
                <Checkbox
                    @change="changeStyle"
                    class="attribute-checkbox"
                    v-model="borderColorEnabled"
                    :binary="true"
                />
                <div :class="['attribute-key', { 'attribute-key-disabled': !borderColorEnabled }]">
                    {{ $t("editor.nodeEdit.borderColor") }}
                </div>
            </div>
            <ColorPicker :disabled="!borderColorEnabled" @change="changeStyle" v-model="elementStyle.borderColor" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { DEFAULT_COLOR, NodeShapes } from "@/shared/NodeShapes";
import ColorPicker from "@/components/ColorPicker.vue";
import { NodeInfo } from "@/modules/editor/modules/graph-editor/controls/nodes/models/NodeInfo";
import { deepCopy, isEmpty } from "@/utility";
import { RestyleCommand } from "@/modules/editor/modules/graph-editor/controls/commands/RestyleCommand";

export default defineComponent({
    name: "ElementEdit",
    components: { ColorPicker },
    data() {
        return {
            // The active restyle command
            restyleCommand: {} as RestyleCommand,
            // The modified object
            elementStyle: {
                name: "Name",
                shape: NodeShapes.RECTANGLE,
                color: "#888888",
                borderColor: "#333333",
            } as NodeInfo,
            // The possible shape values
            shapes: Object.values(NodeShapes).map((shape) => {
                return {
                    name: this.$t(`editor.nodeEdit.shapes.${shape}`),
                    value: shape,
                };
            }),
            // True if a style timeout is active
            styleTimeoutActive: false,
            // The style timeout reference
            styleTimeout: 0,
            // True if the color is enabled
            colorEnabled: true,
            // True if the border color is enabled
            borderColorEnabled: true,
        };
    },
    computed: {
        /**
         * @return True if the currently selected element is a node
         */
        isNode(): boolean {
            return this.$store.state.editor.graphEditor.selectedElement?.isNode();
        },
        /**
         * @return True if the currently selected element is a relation
         */
        isRelation(): boolean {
            return this.$store.state.editor.graphEditor.selectedElement?.isRelation();
        },
    },
    watch: {
        /**
         * Keep the shown element style updated
         */
        "$store.state.editor.graphEditor.selectedElement"() {
            this.updateSelectedElement();
        },
        /**
         * Apply the live update for the node style
         */
        elementStyle: {
            handler() {
                // Check if the update routine is already running
                if (this.styleTimeoutActive) return;
                this.styleTimeoutActive = true;
                this.styleLiveUpdate();

                // Stop the interval after 1s
                this.styleTimeout = setTimeout(() => {
                    this.styleLiveUpdate();
                    this.styleTimeoutActive = false;
                }, 100);
            },
            deep: true,
        },
    },
    methods: {
        /**
         * Update the selected element
         */
        updateSelectedElement(): void {
            // Reset the update timeout and the color flags
            clearTimeout(this.styleTimeout);
            this.colorEnabled = false;
            this.borderColorEnabled = false;

            // Check if an element was selected
            const newElement = this.$store.state.editor.graphEditor.selectedElement;
            if (newElement) {
                this.colorEnabled = !!newElement.info.color;
                this.borderColorEnabled = !!newElement.info.borderColor;
                this.restyleCommand = new RestyleCommand(newElement);
                this.elementStyle = deepCopy(newElement.info);
            } else this.restyleCommand = {} as RestyleCommand;

            // Ensure that there are color values given
            this.elementStyle.color = this.elementStyle.color ?? DEFAULT_COLOR;
            this.elementStyle.borderColor = this.elementStyle.borderColor ?? DEFAULT_COLOR;
        },
        /**
         * Execute a live style update
         */
        styleLiveUpdate(): void {
            const updatedStyle = deepCopy(this.elementStyle);
            if (!this.colorEnabled) updatedStyle.color = undefined;
            if (!this.borderColorEnabled) updatedStyle.borderColor = undefined;
            this.$store.state.editor.graphEditor.selectedElement?.updateStyle(updatedStyle);
        },
        /**
         * Change the shape of the selected node
         */
        changeShape(): void {
            this.$store.dispatch("editor/changeNodeShape", this.elementStyle.shape);
        },
        /**
         * Remove the focus from the dropdown (necessary to disable shortcuts)
         */
        hide(): void {
            (document.activeElement as HTMLElement).blur();
        },
        /**
         * Add the change style command
         */
        changeStyle(): void {
            if (isEmpty(this.restyleCommand)) return;

            // Update the colors
            const newStyle = deepCopy(this.elementStyle);
            if (!this.colorEnabled) newStyle.color = undefined;
            if (!this.borderColorEnabled) newStyle.borderColor = undefined;

            // Apply the new style
            this.restyleCommand.setNewStyle(newStyle);
            this.$store.dispatch("editor/restyleElement", this.restyleCommand);
            this.updateSelectedElement();
            this.restyleCommand = new RestyleCommand(this.$store.state.editor.graphEditor.selectedElement);
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

.attribute-item {
    margin-top: 8px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 8px 16px;
    border-bottom: 1px solid @grey;
    align-items: center;
}

.attribute-item-disabled {
    opacity: 0.6;
    pointer-events: none;
}

.attribute-key {
    font-weight: bold;
    display: flex;
    gap: 12px;
    align-items: center;
}

.attribute-key-disabled {
    text-decoration: line-through;
}

.attribute-value {
    display: flex;
    gap: 12px;
    text-align: right;
}
</style>
