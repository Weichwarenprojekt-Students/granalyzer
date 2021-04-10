<template>
    <div v-if="$store.state.editor.inspector.visible" class="content">
        <div class="underlined-title">{{ $t("global.inspector") }}</div>
        <ScrollPanel class="scroll-panel">
            <AttributeItem
                v-for="attribute in $store.state.editor.inspector.attributes"
                :key="attribute.name"
                :attribute="attribute"
            ></AttributeItem>
            <div class="space" />
        </ScrollPanel>
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
    height: 100%;
    border-left: 1px solid @grey;
    padding: 0 16px;

    display: flex;
    flex-flow: column;
}

.underlined-title {
    padding: 0;
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
