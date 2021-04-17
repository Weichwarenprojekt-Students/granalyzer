<template>
    <div v-if="$store.state.editor.inspector.attributes.length > 0" class="content">
        <div class="underlined-title">
            {{ $store.state.editor.inspector.elementName }}
        </div>
        <ScrollPanel class="scroll-panel">
            <AttributeItem
                v-for="attribute in $store.state.editor.inspector.attributes"
                :key="attribute.name"
                :attribute="attribute"
            ></AttributeItem>
            <div class="space" />
        </ScrollPanel>
    </div>
    <div v-else class="empty-warning">
        <svg>
            <use :xlink:href="`${require('@/assets/img/icons.svg')}#info`"></use>
        </svg>
        <div class="message">{{ $t("global.inspector.nothing-selected") }}</div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AttributeItem from "@/modules/editor/modules/inspector/components/AttributeItem.vue";

export default defineComponent({
    name: "Inspector",
    components: {
        AttributeItem,
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.content {
    display: flex;
    flex-flow: column;

    height: 100%;
    border-left: 1px solid @grey;
    padding: 0 16px;
}

.empty-warning {
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.underlined-title {
    padding: 0;
    font-style: italic;
}

.scroll-panel {
    margin-top: 8px !important;
    overflow: hidden !important;
    flex: 1 1 auto !important;

    .space {
        padding-bottom: 24px;
    }
}
</style>
