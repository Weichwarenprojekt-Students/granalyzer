<template>
    <div class="content main-content">
        <CollapsablePanel :left="true" :force-collapse="$store.state.editor.hidePanels">
            <OverviewList
                :selectedItemId="$store.state.editor.selectedNode?.nodeId"
                @on-node-clicked="onNodeClicked"
                @on-node-drag="onNodeDrag"
            ></OverviewList>
        </CollapsablePanel>
        <div class="center">
            <EditorHeader class="header"></EditorHeader>
            <GraphEditor v-if="$store.state.editor.diagram" class="editor"></GraphEditor>
            <div v-else class="empty-warning">
                <svg>
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#info`"></use>
                </svg>
                <div class="message">{{ $t("editor.nothing-loaded") }}</div>
            </div>
        </div>
        <CollapsablePanel :left="false" :force-collapse="$store.state.editor.hidePanels">
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
                    <ScrollPanel class="toolbox-scroll">
                        <NodeEdit class="toolbox-item" />
                        <VisualElements class="toolbox-item" />
                        <HeatMap class="toolbox-item" />
                    </ScrollPanel>
                </div>
                <ReadInspector v-else></ReadInspector>
            </div>
        </CollapsablePanel>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EditorHeader from "@/modules/editor/components/EditorHeader.vue";
import OverviewList from "@/modules/overview-list/OverviewList.vue";
import GraphEditor from "@/modules/editor/modules/graph-editor/GraphEditor.vue";
import ReadInspector from "@/modules/inspector/ReadInspector.vue";
import ApiNode from "@/models/data-scheme/ApiNode";
import VisualElements from "@/modules/editor/components/VisualElements.vue";
import { NodeDrag } from "@/shared/NodeDrag";
import NodeEdit from "@/modules/editor/components/ElementEdit.vue";
import { NodeFilter } from "@/modules/overview-list/models/NodeFilter";
import HeatMap from "@/modules/editor/modules/heat-map/HeatMap.vue";
import CollapsablePanel from "@/components/CollapsablePanel.vue";

export default defineComponent({
    name: "Editor",
    components: {
        CollapsablePanel,
        NodeEdit,
        VisualElements,
        HeatMap,
        GraphEditor,
        EditorHeader,
        OverviewList,
        ReadInspector,
    },
    async beforeCreate() {
        this.$store.commit("inspector/resetSelection");
        await this.$store.dispatch("editor/fetchActiveDiagram");
    },
    methods: {
        /**
         * Store node that was selected
         */
        onNodeClicked(node: ApiNode): void {
            this.$store.commit("overview/updateFilter", new NodeFilter());
            this.$store.commit("editor/setSelectedNode", node);
            this.$store.dispatch("inspector/selectNode", node.nodeId);
        },
        /**
         * Store dragged node
         */
        onNodeDrag(drag: NodeDrag): void {
            this.$store.commit("editor/setDraggedNode", drag);
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

.editor-tools {
    width: @side_panel_width;
    height: 100vh;
    display: flex;
    flex-direction: column;
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
    position: relative;
}

.toolbox-scroll {
    position: absolute;
    top: 0;
    bottom: 0;
    overflow: hidden;
}

.toolbox-item {
    margin-right: 18px;
}
</style>
