<template>
    <div>
        <div class="underlined-title">
            {{ $t("editor.nodeEdit.title") }}
        </div>

        <!-- The node text -->
        <div :class="['attribute-item', { 'attribute-item-disabled': !isNode && !isRelation }]">
            <div class="attribute-key" :disabled="true">
                {{ $t("editor.nodeEdit.text") }}
            </div>
            <input v-model="elementStyle.name" class="input text-input" :placeholder="$t('global.input.placeholder')" />
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
                {{ $t("editor.nodeEdit.color") }}
            </div>
            <ColorMultiInput v-model="elementStyle.color" />
        </div>

        <!-- The border color -->
        <div :class="['attribute-item', { 'attribute-item-disabled': !isNode && !isRelation }]">
            <div class="attribute-key">
                {{ $t("editor.nodeEdit.borderColor") }}
            </div>
            <ColorMultiInput v-model="elementStyle.borderColor" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { NodeShapes } from "@/shared/NodeShapes";
import ColorMultiInput from "@/components/ColorMultiInput.vue";
import { NodeInfo } from "@/modules/editor/modules/graph-editor/controls/nodes/models/NodeInfo";
import { deepCopy } from "@/utility";

export default defineComponent({
    name: "ElementEdit",
    components: { ColorMultiInput },
    data() {
        return {
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
        "$store.state.editor.graphEditor.selectedElement"(): void {
            if (this.$store.state.editor.graphEditor.selectedElement)
                this.elementStyle = deepCopy(this.$store.state.editor.graphEditor.selectedElement.info);
        },
    },
    methods: {
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
}

.attribute-value {
    display: flex;
    gap: 12px;
    text-align: right;
}
</style>
