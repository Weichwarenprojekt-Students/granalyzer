<template>
    <div class="content">
        <OverviewList
            :nodesReady="$store.getters['nodesReady']"
            :nodes="$store.state.nodes"
            :labels="$store.state.labels"
            :labelColors="$store.state.labelColor"
            :toggleScrollEmit="toggleScrollEmit"
            :selectedItemId="$store.state.editor.selectedNode?.nodeId"
            class="overview"
            @extend-nodes="extendNodes"
            @clicked-on-node="clickedOnNode"
            @user-filter="handleFilter"
        ></OverviewList>
        <div class="center">
            <EditorHeader class="header"></EditorHeader>
            <GraphEditor class="editor"></GraphEditor>
        </div>
        <Inspector class="inspector"></Inspector>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EditorHeader from "@/modules/editor/modules/editor-header/EditorHeader.vue";
import OverviewList from "@/components/overview-list/OverviewList.vue";
import GraphEditor from "@/modules/editor/modules/graph-editor/GraphEditor.vue";
import Inspector from "@/modules/editor/modules/inspector/Inspector.vue";
import ApiNode from "@/models/data-scheme/ApiNode";

export default defineComponent({
    name: "Editor",
    components: {
        GraphEditor,
        EditorHeader,
        OverviewList,
        Inspector,
    },
    data() {
        return {
            // Toggle reloading of nodes for the overview list
            toggleScrollEmit: true,
            // Filter for node reloading
            filter: {
                // Input in the searchbar
                userInput: "",
                // Labels to filter by
                labelsToFilterBy: [] as Array<string>,
            },
        };
    },
    mounted() {
        // Load the labels with the first load of matching nodes
        this.$store.dispatch("loadLabelsAndNodes");
    },
    methods: {
        /**
         * Extend the node list
         */
        async extendNodes(): Promise<void> {
            await this.$store.dispatch("extendNodes", this.filter);
            this.toggleScrollEmit = !this.toggleScrollEmit;
        },
        /**
         * Store node that was selected
         */
        clickedOnNode(node: ApiNode): void {
            this.$store.commit("editor/setSelectedNode", node);
        },
        /**
         * Filter nodes by labels and user-input
         */
        handleFilter(filter: { userInput: string; labelsToFilterBy: Array<string> }): void {
            this.filter.userInput = filter.userInput;
            this.filter.labelsToFilterBy = filter.labelsToFilterBy;

            this.$store.dispatch("loadLabelsAndNodes", filter);
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
