<template>
    <div class="attribute-item no-border">
        <svg v-if="attribute.datatype === types.STRING" class="attribute-icon">
            <use :xlink:href="require('@/assets/img/icons.svg') + '#text'"></use>
        </svg>
        <svg v-else-if="attribute.datatype === types.NUMBER" class="attribute-icon">
            <use :xlink:href="require('@/assets/img/icons.svg') + '#number'"></use>
        </svg>
        <svg v-else-if="attribute.datatype === types.COLOR" class="attribute-icon">
            <circle r="6" :fill="attribute.value" cx="6" cy="6" />
        </svg>
        <div class="attribute-key attributes-key">{{ attribute.name }}</div>
        <div class="attribute-value">
            {{ attribute.value }}
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { InspectorAttribute } from "@/modules/inspector/models/InspectorAttribute";
import { ApiDatatype } from "@/models/data-scheme/ApiDatatype";

export default defineComponent({
    name: "ReadAttribute",
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
@import "../styles/inspector.less";

.attribute-icon {
    width: 12px;
    height: 12px;
    margin-top: 2px;
    flex: 0 0 auto;
}

.attribute-value {
    flex: 1 1 auto;
    justify-content: flex-end;
}
</style>
