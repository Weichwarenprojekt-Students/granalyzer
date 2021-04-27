<template>
    <div>
        <div class="underlined-title">
            {{ $t("editor.nodeEdit.title") }}
        </div>

        <!-- The node text -->
        <div class="attribute-item">
            <div class="attribute-key">
                {{ $t("editor.nodeEdit.text") }}
            </div>
            <input v-model="node.name" class="input text-input" :placeholder="$t('global.input.placeholder')" />
        </div>

        <!-- The node shape -->
        <div class="attribute-item">
            <div class="attribute-key">
                {{ $t("editor.nodeEdit.shape") }}
            </div>
            <Dropdown
                :options="shapes"
                optionLabel="name"
                optionValue="value"
                v-model="node.shape"
                :placeholder="$t('global.dropdown.choose')"
                :emptyMessage="$t('global.dropdown.empty')"
            />
        </div>

        <!-- The fill color -->
        <div class="attribute-item">
            <div class="attribute-key">
                {{ $t("editor.nodeEdit.color") }}
            </div>
            <ColorMultiInput v-model="node.color" />
        </div>

        <!-- The border color -->
        <div class="attribute-item">
            <div class="attribute-key">
                {{ $t("editor.nodeEdit.borderColor") }}
            </div>
            <ColorMultiInput v-model="node.borderColor" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { NodeShapes } from "@/shared/NodeShapes";
import ColorMultiInput from "@/components/ColorMultiInput.vue";
import { NodeInfo } from "@/modules/editor/modules/graph-editor/controls/nodes/models/NodeInfo";

export default defineComponent({
    name: "NodeEdit",
    components: { ColorMultiInput },
    data() {
        return {
            // The modified object
            node: {
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

.attribute-key {
    font-weight: bold;
}

.attributes-key {
    font-weight: 500;
}

.attribute-value {
    display: flex;
    gap: 12px;
    text-align: right;
}
</style>
