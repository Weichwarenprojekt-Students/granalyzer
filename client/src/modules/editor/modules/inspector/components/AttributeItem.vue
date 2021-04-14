<template>
    <div class="attribute-item">
        <div class="attribute-key">{{ attribute.name }}:</div>
        <div class="attribute-value">
            <svg v-if="attribute.datatype === types.STRING" class="attribute-icon">
                <use :xlink:href="require('@/assets/img/icons.svg') + '#text'"></use>
            </svg>
            <svg v-else-if="attribute.datatype === types.NUMBER" class="attribute-icon">
                <use :xlink:href="require('@/assets/img/icons.svg') + '#number'"></use>
            </svg>
            <svg v-else-if="attribute.datatype === types.COLOR" class="attribute-icon">
                <circle r="8" :fill="attribute.value" cx="8" cy="8" />
            </svg>
            <div>{{ attribute.value }}</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { InspectorAttribute } from "@/modules/editor/modules/inspector/models/InspectorAttribute";
import { ApiDatatype } from "@/models/data-scheme/ApiDatatype";

export default defineComponent({
    name: "AttributeItem",
    props: {
        attribute: {
            type: Object,
            default: new InspectorAttribute(),
        },
    },
    data() {
        return {
            types: ApiDatatype,
        };
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.attribute-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 8px 16px;
    margin-right: 18px;
    margin-bottom: 8px;
    gap: 24px;
    border-bottom: 1px solid @grey;
}

.attribute-key {
    font-weight: bold;
}

.attribute-icon {
    width: 12px;
    height: 12px;
    margin-top: 2px;
    flex: 0 0 auto;
}

.attribute-value {
    display: flex;
    gap: 12px;
}
</style>
