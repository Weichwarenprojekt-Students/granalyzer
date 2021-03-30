<template>
    <div class="content">
        <OverviewList class="overview"></OverviewList>
        <EditorHeader class="header"></EditorHeader>
        <GraphEditor class="editor"></GraphEditor>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { isEmpty } from "@/utility";
import EditorHeader from "@/modules/editor/modules/editor-header/EditorHeader.vue";
import OverviewList from "@/modules/editor/modules/overview-list/OverviewList.vue";
import GraphEditor from "@/modules/editor/modules/graph-editor/GraphEditor.vue";

export default defineComponent({
    name: "Editor",
    components: {
        GraphEditor,
        EditorHeader,
        OverviewList,
    },
    computed: {
        title(): string {
            const diagram = this.$store.state.editor.diagram;
            if (!isEmpty(diagram)) return diagram;
            else return this.$t("editor.title");
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/styles.less";

@header-height: 64px;

.content {
    width: 100%;
    height: 100%;
    background: @light_grey;
    position: relative;

    .header {
        width: 100%;
        height: @header-height;
        background: white;
        position: absolute;
        top: 0;
        left: 0;
    }

    .overview {
        width: @inventory_width;
        height: 100vh;
        position: relative;
        z-index: 4000;
        background: white;
    }

    .editor {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: @header-height;
    }
}
</style>
