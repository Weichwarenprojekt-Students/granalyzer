<template>
    <div id="graphContainer" @mousemove="graph.mousemove">
        <div id="joint" @dragover.prevent @drop.stop.prevent />
        <Toolbar />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { GraphHandler } from "./undo-redo/GraphHandler";
import { isEmpty } from "@/utility";
import Toolbar from "./components/Toolbar.vue";
import { JointGraph } from "@/modules/editor/modules/graph-editor/JointGraph";

export default defineComponent({
    name: "GraphEditor",
    components: {
        Toolbar,
    },
    data() {
        return {
            graph: {} as JointGraph,
        };
    },
    async mounted(): Promise<void> {
        // TODO: Add loading bar
        this.initGraph();
        this.loadActiveDiagram();
    },
    methods: {
        /**
         * Initialize the joint graph and register some basic events
         */
        initGraph(): void {
            this.graph = new JointGraph("joint");
            this.$store.commit("editor/setGraphHandler", new GraphHandler(this.graph));

            // Watch for drag events from the overview list TODO: Fix Linux bug
            this.graph.paper.on("paper:mouseenter", (evt) => {
                // Check, if user is allowed to drag a node into the diagram
                if (this.$store.state.editor.canDragIntoDiagram) {
                    // Get the mouse position in the graph and add the node accordingly
                    const point = this.graph.paper.clientToLocalPoint({ x: evt.clientX, y: evt.clientY });
                    const node = this.$store.state.editor.lastDraggedContent;
                    this.$store.dispatch("editor/addNode", {
                        x: point.x,
                        y: point.y,
                        shape: "rectangle",
                        color: node.color,
                        label: node.name,
                        ref: {
                            uuid: node.id,
                            index: 0,
                        },
                    });
                }
            });

            // Find out if user clicked element and set element object
            this.graph.paper.on("element:pointerdown", (cell) =>
                // Get selected element
                this.$store.commit("editor/setClickedItem", cell.model),
            );

            // Get unselected element
            this.graph.paper.on("element:pointerup", (cell) => {
                this.$store.commit("editor/setReleasedItem", cell.model);
            });

            // No element selected
            this.graph.paper.on("blank:pointerdown", () => this.$store.commit("editor/setClickedItem", undefined));
        },
        /**
         * Load the currently active diagram
         */
        loadActiveDiagram(): void {
            if (isEmpty(this.$store.state.editor.diagram)) {
                this.$toast.add({
                    severity: "error",
                    summary: this.$t("editor.noDiagram.title"),
                    detail: this.$t("editor.noDiagram.description"),
                    life: 3000,
                });
            } else {
                this.$store.commit("editor/setDiagram", this.$store.state.editor.diagram);
            }
        },
    },
});
</script>

<style lang="less">
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
</style>
