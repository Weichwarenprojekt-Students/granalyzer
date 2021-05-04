<template>
    <div class="attribute-item no-border">
        <div class="attribute-key">
            <svg v-if="attribute.datatype === types.STRING" class="attribute-icon">
                <use :xlink:href="require('@/assets/img/icons.svg') + '#text'"></use>
            </svg>
            <svg v-else-if="attribute.datatype === types.NUMBER" class="attribute-icon">
                <use :xlink:href="require('@/assets/img/icons.svg') + '#number'"></use>
            </svg>
            <svg v-else-if="attribute.datatype === types.ENUM" class="attribute-icon">
                <use :xlink:href="require('@/assets/img/icons.svg') + '#enum'"></use>
            </svg>
            <svg v-else-if="attribute.datatype === types.COLOR" class="attribute-icon">
                <circle r="7" :fill="attribute.value" cx="7" cy="7" />
            </svg>
            <div class="attributes-key">{{ attribute.name }}</div>
        </div>
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
        // Displayed attribute
        attribute: {
            type: Object,
            default: new InspectorAttribute(),
        },
    },
    data() {
        return {
            // Possible attribute types
            types: ApiDatatype,
        };
    },
});
</script>

<style lang="less" scoped>
@import "../styles/inspector.less";

.attribute-item {
    align-items: start;
}

.attribute-icon {
    width: 14px;
    height: 14px;
    flex: 0 0 auto;
    fill: @dark;
}

.attribute-key {
    display: flex;
    flex-direction: row;
    gap: 12px;
    align-items: center;
    overflow: hidden;
    width: @key_width;
    flex: 0 0 auto;

    div {
        text-overflow: ellipsis;
        overflow: hidden;
    }
}

.attribute-value {
    flex: 1 1 auto;
    justify-content: flex-end;
}
</style>
