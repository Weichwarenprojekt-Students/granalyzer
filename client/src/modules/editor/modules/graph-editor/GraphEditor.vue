<template>
    <div id="graphContainer" @mousemove="mousemove">
        <div id="joint" @dragover.prevent @drop.stop.prevent />
        <Toolbar />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { dia } from "jointjs";
import { GraphHandler } from "./GraphHandler";
import { isEmpty } from "@/utility";
import Toolbar from "./components/Toolbar.vue";

export class GraphOptions implements dia.Paper.Options {
    // eslint-disable-next-line no-undef
    [key: string]: unknown;
}

export default defineComponent({
    name: "GraphEditor",
    components: {
        Toolbar,
    },
    data() {
        return {
            graph: {} as dia.Graph,
            paper: {} as dia.Paper,
            panning: false,
            // eslint-disable-next-line
            event_data: {} as any,
            selectedElement: {},
        };
    },
    async mounted(): Promise<void> {
        // TODO: Move this logic to a reusable class/construct
        this.initGraph();
        this.loadActiveDiagram();
    },
    methods: {
        initGraph(): void {
            // Create the graph
            this.graph = new dia.Graph();
            const config: GraphOptions = {
                el: document.getElementById("joint"),
                model: this.graph,
                width: "100%",
                height: "100%",
                gridSize: 1,
            };
            this.paper = new dia.Paper(config);
            this.paper.translate(500, 200);
            this.paper.scale(0.6, 0.6);
            this.registerEvents();

            // Set the new graph handler
            this.$store.commit("editor/setGraphHandler", new GraphHandler(this.graph, this.paper));
        },
        loadActiveDiagram(): void {
            // Check if the diagram has been loaded into the store
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
        registerEvents(): void {
            // Start panning the diagram
            this.paper.on("blank:pointerdown", (evt) => {
                const offset = this.paper.translate();
                this.event_data = { x: evt.offsetX, y: evt.offsetY, px: offset.tx, py: offset.ty };
                this.panning = true;
            });

            // Stop panning the diagram
            this.paper.on("blank:pointerup", () => {
                this.event_data = {};
                this.panning = false;
            });

            // Zoom the paper while over any element
            this.paper.on("element:mousewheel link:mousewheel cell:mousewheel", (cellView, evt, x, y, delta) => {
                this.zoom(delta, x, y);
            });

            // Zoom the paper while over blank space
            this.paper.on("blank:mousewheel", (evt, x, y, delta) => {
                this.zoom(delta, x, y);
            });

            // Mouse enter event for the paper
            this.paper.on("paper:mouseenter", (evt) => {
                // Check, if user is allowed to drag a node into the diagram
                if (this.$store.state.editor.canDragIntoDiagram) {
                    // Get the mouse position in the graph
                    const point = this.paper.clientToLocalPoint({ x: evt.clientX, y: evt.clientY });
                    // Get the node that was dragged into the graph
                    const node = this.$store.state.editor.lastDraggedContent;
                    // Add the node to the graph
                    this.$store.dispatch("editor/addNode", {
                        x: point.x,
                        y: point.y,
                        shape: "rectangle",
                        color: node.color,
                        label: node.name,
                        ref: {
                            uuid: "0",
                            index: 0,
                        },
                    });
                }
            });

            // Find out if user clicked element and set element object
            this.paper.on("element:pointerdown", (cell) => {
                for (let element of this.graph.getElements())
                    element.attr({
                        body: {
                            strokeWidth: 0,
                        },
                    });
                cell.model.attr({
                    body: {
                        strokeWidth: 4,
                    },
                });
                this.$store.commit("editor/setClickedItem", cell.model);
            });

            // No element selected
            this.paper.on("blank:pointerdown", () => {
                for (let element of this.graph.getElements())
                    element.attr({
                        body: {
                            strokeWidth: 0,
                        },
                    });
                this.$store.commit("editor/setClickedItem", undefined);
            });
        },
        /**
         * Move the diagram paper
         */
        // eslint-disable-next-line
        mousemove(event: any): void {
            let tx = event.offsetX - this.event_data.x;
            let ty = event.offsetY - this.event_data.y;
            if (this.panning) this.paper.translate(tx + this.event_data.px, ty + this.event_data.py);
        },
        /**
         * Zoom the diagram paper
         * @param delta The amount the mousewheel has changed
         * @param x The x coordinate of the mousewheel event
         * @param y The y coordinate of the mousewheel event
         */
        zoom(delta: number, x: number, y: number): void {
            const oldScale = this.paper.scale().sx;
            const nextScale = 1.1 ** delta * oldScale;

            if (nextScale >= 0.1 && nextScale <= 10) {
                const currentScale = this.paper.scale().sx;

                const beta = currentScale / nextScale;

                const ax = x - x * beta;
                const ay = y - y * beta;

                const translate = this.paper.translate();

                const nextTx = translate.tx - ax * nextScale;
                const nextTy = translate.ty - ay * nextScale;

                this.paper.translate(nextTx, nextTy);

                const ctm = this.paper.matrix();

                ctm.a = nextScale;
                ctm.d = nextScale;

                this.paper.matrix(ctm);
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
