<template>
    <div class="container" @mousemove="graph.mousemove">
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
import { GraphControls } from "./controls/GraphControls";

export default defineComponent({
    name: "GraphEditor",
    components: {
        Toolbar,
    },
    data() {
        return {
            graph: {} as JointGraph,
            editorControls: {} as GraphControls,
        };
    },
    async mounted(): Promise<void> {
        this.$store.dispatch("editor/setRelationMode", false);

        // Load the currently opened diagram from REST backend
        await this.$store.dispatch("editor/fetchActiveDiagram");

        // Load the labels with the first load of matching nodes
        await this.$store.dispatch("loadLabelsAndNodes");

        // Set up the graph and the controls
        this.graph = new JointGraph("joint");
        this.$store.commit("editor/setGraphHandler", new GraphHandler(this.$store, this.graph));

        // Generate the active diagram if available
        if (!this.$store.state.editor.diagram) {
            this.$toast.add({
                severity: "error",
                summary: this.$t("editor.noDiagram.title"),
                detail: this.$t("editor.noDiagram.description"),
                life: 3000,
            });
        } else {
            this.$store.commit("editor/generateDiagramFromJSON", this.$store.state.editor.diagram);
        }
    },
    watch: {
        async relationModeActive(state, oldState) {
            if (oldState === state) return;

            if (state) {
                this.$store.commit("editor/setEditorLoading", true);
                await this.$store.state.editor.graphEditor.graphHandler.controls.switchRelationsForActiveRelationMode();
                this.$store.commit("editor/setEditorLoading", false);
            } else {
                this.$store.commit("editor/setEditorLoading", true);
                await this.$store.state.editor.graphEditor.graphHandler.controls.switchRelationsForInactiveRelationMode();
                this.$store.commit("editor/setEditorLoading", false);
            }
        },
    },
    methods: {
        /**
         * Check if a node from the overview list was dropped
         */
        // eslint-disable-next-line
        onNodeDrop(evt: any): void {
            // Disable adding nodes in relation edit mode
            if (this.relationModeActive) {
                this.$toast.add({
                    severity: "warn",
                    summary: this.$t("editor.relationModeToast.title"),
                    detail: this.$t("editor.relationModeToast.description"),
                    life: 4000,
                });
                return;
            }

            // Get the selected node
            const node = this.$store.state.editor.selectedNode;
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
    },
    computed: {
        relationModeActive(): boolean {
            return this.$store.getters["editor/relationModeActive"];
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

#graphContainer {
    > div {
        > svg {
            background: #f2f2f2;
        }
    }
}
</style>
