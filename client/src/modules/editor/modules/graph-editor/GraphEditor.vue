<template>
    <div class="container" @mousemove="mousemove">
        <!-- The dialog for adding a new visual relation -->
        <InputDialog
            @input-confirm="addNewVisualRelation"
            @cancel="$store.dispatch('editor/closeNewRelationDialog')"
            :show="$store.state.editor.graphEditor.newRelationDialog"
            :image-src="`${require('@/assets/img/icons.svg')}#relation`"
            :title="$t('editor.graphEditor.setRelationName')"
        ></InputDialog>
        <ProgressBar
            v-show="$store.state.editor.graphEditor.editorLoading"
            mode="indeterminate"
            class="graph-editor-loading"
        />
        <Toolbar v-show="!$store.state.editor.graphEditor.editorLoading" />
        <div
            id="joint"
            :class="{ disabled: $store.state.editor.graphEditor.editorLoading }"
            @dragover.prevent
            @drop="onNodeDrop"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { GraphHandler } from "./controls/GraphHandler";
import Toolbar from "./components/Toolbar.vue";
import { JointGraph } from "@/shared/JointGraph";
import { errorToast, infoToast } from "@/utility";
import InputDialog from "@/components/dialog/InputDialog.vue";
import { NodeFilter } from "@/modules/overview-list/models/NodeFilter";

export default defineComponent({
    name: "GraphEditor",
    components: {
        Toolbar,
        InputDialog,
    },
    data() {
        return {
            graph: {} as JointGraph,
        };
    },
    async mounted(): Promise<void> {
        this.$store.dispatch("editor/setRelationMode", false);

        // Load the currently opened diagram from REST backend
        await this.$store.dispatch("editor/fetchActiveDiagram");

        // Load the labels with the first load of matching nodes
        await this.$store.dispatch("overview/loadLabelsAndNodes", new NodeFilter());

        // Set up the graph and the controls
        this.graph = new JointGraph("joint");
        this.$store.commit("editor/setGraphHandler", new GraphHandler(this.$store, this.graph));

        // Generate the active diagram if available
        if (!this.$store.state.editor.diagram) {
            errorToast(this.$t("editor.noDiagram.title"), this.$t("editor.noDiagram.description"));
        } else {
            this.$store.commit("editor/generateDiagramFromJSON", this.$store.state.editor.diagram);
        }
    },
    watch: {
        async "$store.state.editor.graphEditor.relationModeActive"() {
            this.$store.commit("editor/setEditorLoading", true);

            if (this.$store.state.editor.graphEditor.relationModeActive) {
                await this.$store.state.editor.graphEditor.graphHandler.relationMode.enable();
            } else {
                await this.$store.state.editor.graphEditor.graphHandler.relationMode.disable();
            }
            this.$store.commit("editor/setEditorLoading", false);
        },
    },
    methods: {
        /**
         * Check if a node from the overview list was dropped
         */
        // eslint-disable-next-line
        onNodeDrop(evt: any): void {
            // Disable adding nodes in relation edit mode
            if (this.$store.state.editor.graphEditor.relationModeActive) {
                infoToast(this.$t("editor.relationModeToast.title"), this.$t("editor.relationModeToast.description"));
                return;
            }

            // Get the selected node
            const node = this.$store.state.editor.draggedNode;
            if (!node) return;

            // Get the mouse position in the graph and add the node accordingly
            const point = this.graph.paper.clientToLocalPoint({ x: evt.clientX, y: evt.clientY });
            this.$store.dispatch("editor/addNode", {
                x: point.x,
                y: point.y,
                shape: "rectangle",
                label: node.label,
                name: node.name,
                ref: {
                    uuid: node.nodeId,
                    index: 0,
                },
            });
        },
        /**
         * Call mousemove methods of JointGraph and RelationModeControls
         */
        // eslint-disable-next-line
        mousemove(event: any): void {
            this.$store.state.editor.graphEditor.graphHandler?.graph.mousemove(event);
            this.$store.state.editor.graphEditor.graphHandler?.relationMode.mousemove(event);
        },
        /**
         * Callback for the new relation dialog to add a new relation
         *
         * @param relationName name of the relation
         */
        addNewVisualRelation(relationName: string): void {
            this.$store.dispatch("editor/confirmNewRelationDialog", relationName);
        },
    },
});
</script>

<style lang="less">
@import "~@/styles/global";

.container {
    position: relative;
}

.graph-editor-loading {
    position: absolute !important;
    top: 0;
    left: 0;
    right: 0;
}

.disabled {
    pointer-events: none;
}

.node {
    cursor: pointer;
}

.node + text {
    color: grey;
    cursor: pointer;

    tspan {
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
    }
}

.label {
    cursor: pointer;

    text {
        tspan {
            font-size: 16px;
        }
    }
}

#joint {
    > svg {
        background: #f2f2f2;
    }
}
</style>
