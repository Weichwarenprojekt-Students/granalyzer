<template>
    <div class="content">
        <EditorHeader class="header"></EditorHeader>
        <GraphEditor class="editor"></GraphEditor>
        <OverviewList
            v-if="nodesAndLabelsLoaded"
            class="overview"
            :nodes="$store.state.editor.nodes"
            :labelColor="$store.state.editor.labelColor"
        ></OverviewList>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
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
    mounted() {
        this.$store.dispatch("editor/loadNodes", false);
        this.$store.dispatch("editor/loadLabels");
    },
    computed: {
        /**
         * Make sure the state contains necessary data that needs to be provided to the overview list
         */
        nodesAndLabelsLoaded(): boolean {
            return this.$store.state.editor.nodes.length > 0 && this.$store.state.editor.labels.length > 0;
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
