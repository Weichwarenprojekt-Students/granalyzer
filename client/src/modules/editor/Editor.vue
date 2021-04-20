<template>
    <div class="content">
        <OverviewList
            :selectedItemId="$store.state.editor.selectedNode?.nodeId"
            class="overview"
            @clicked-on-node="clickedOnNode"
        ></OverviewList>
        <div class="center">
            <EditorHeader class="header"></EditorHeader>
            <GraphEditor class="editor"></GraphEditor>
        </div>
        <ReadInspector class="inspector"></ReadInspector>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EditorHeader from "@/modules/editor/modules/editor-header/EditorHeader.vue";
import OverviewList from "@/modules/overview-list/OverviewList.vue";
import GraphEditor from "@/modules/editor/modules/graph-editor/GraphEditor.vue";
import ReadInspector from "@/modules/inspector/ReadInspector.vue";
import ApiNode from "@/models/data-scheme/ApiNode";

export default defineComponent({
    name: "Editor",
    components: {
        GraphEditor,
        EditorHeader,
        OverviewList,
        ReadInspector,
    },
    methods: {
        /**
         * Store node that was selected
         */
        clickedOnNode(node: ApiNode): void {
            this.$store.commit("editor/setSelectedNode", node);
            this.$store.dispatch("inspector/selectNode", node.nodeId);
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.content {
    width: 100%;
    height: 100%;
    background: @light_grey;
    display: flex;
}

.overview {
    width: @inventory_width;
    height: 100vh;
    flex: 0 0 auto;
    background: white;
}

.inspector {
    width: @inspector_width;
    height: 100vh;
    flex: 0 0 auto;
    background: white;
}

.center {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
}

.header {
    width: 100%;
    height: @header-height;
    background: white;
    flex: 0 0 auto;
}

.editor {
    flex: 1 1 auto;
}
</style>
