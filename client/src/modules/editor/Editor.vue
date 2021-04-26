<template>
    <div class="content main-content">
        <OverviewList
            :selectedItemId="$store.state.editor.selectedNode?.nodeId"
            class="overview"
            @clicked-on-node="clickedOnNode"
            @dragging-node="draggingNode"
        ></OverviewList>
        <div class="center">
            <EditorHeader class="header"></EditorHeader>
            <GraphEditor class="editor"></GraphEditor>
        </div>
        <div class="editor-tools">
            <!-- The tabs -->
            <div class="tabs">
                <div
                    @click="$store.commit('editor/openTools', true)"
                    :class="{ 'selected-tab': $store.state.editor.toolsOpen }"
                >
                    {{ $t("editor.toolbox") }}
                </div>
                <div
                    @click="$store.commit('editor/openTools', false)"
                    :class="{ 'selected-tab': !$store.state.editor.toolsOpen }"
                >
                    {{ $t("editor.inspector") }}
                </div>
            </div>

            <!-- The content -->
            <div v-if="$store.state.editor.toolsOpen" class="toolbox">
                <VisualElements />
                <div>
                    <div style="border-color: #333; padding: 8px 0; height: auto" class="underlined-title">
                        Heat Map
                    </div>
                </div>
            </div>
            <ReadInspector v-else></ReadInspector>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EditorHeader from "@/modules/editor/components/EditorHeader.vue";
import OverviewList from "@/modules/overview-list/OverviewList.vue";
import GraphEditor from "@/modules/editor/modules/graph-editor/GraphEditor.vue";
import ReadInspector from "@/modules/inspector/ReadInspector.vue";
import ApiNode from "@/models/data-scheme/ApiNode";
import VisualElements from "@/modules/editor/modules/visual-elements/VisualElements.vue";

export default defineComponent({
    name: "Editor",
    components: {
        VisualElements,
        GraphEditor,
        EditorHeader,
        OverviewList,
        ReadInspector,
    },
    beforeCreate() {
        this.$store.commit("inspector/resetSelection");
    },
    methods: {
        /**
         * Store node that was selected
         */
        clickedOnNode(node: ApiNode): void {
            this.$store.commit("editor/setSelectedNode", node);
            this.$store.dispatch("inspector/selectNode", node.nodeId);
        },
        /**
         * Store dragged node
         */
        draggingNode(node: ApiNode): void {
            this.$store.commit("editor/setDraggedNode", node);
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.main-content {
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

.editor-tools {
    width: @inspector_width;
    height: 100vh;
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    background: white;
    border-left: 1px solid @grey;
    padding: 0 16px;
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

.toolbox {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
}
</style>
