<template>
    <div class="content">
        <EditorHeader class="header"></EditorHeader>
        <OverviewList class="overview"></OverviewList>
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

    .header {
        width: 100%;
        height: @header-height;
        background: white;
    }

    .overview {
        width: @inventory_width;
        height: 100vh;

        position: absolute;
        left: @navbar_width_collapsed;
        top: 0;

        background: white;
    }

    .editor {
        position: absolute;
        left: @navbar_width_collapsed + @inventory_width;
        right: 0;
        bottom: 0;
        top: @header-height;
    }
}
</style>
