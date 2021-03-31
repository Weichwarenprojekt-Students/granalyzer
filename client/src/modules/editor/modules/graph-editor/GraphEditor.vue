<template>
    <div id="graphContainer" @mousemove="mousemove">
        <div id="joint" @dragover.prevent @drop.stop.prevent />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { dia, shapes } from "jointjs";
import { GET } from "@/utility";
import { Diagram } from "./models/Diagram";

export class GraphOptions implements dia.Paper.Options {
    // eslint-disable-next-line no-undef
    [key: string]: unknown;
}

export class GraphRectangle extends shapes.standard.Rectangle {
    // eslint-disable-next-line no-undef
    [key: string]: unknown;
}

export default defineComponent({
    name: "GraphEditor",
    data() {
        return {
            graph: {} as dia.Graph,
            paper: {} as dia.Paper,
            data: {} as Diagram,
            panning: false,
            // eslint-disable-next-line
            event_data: {} as any,
        };
    },
    async mounted(): Promise<void> {
        const result = await GET(
            "https://gw.alipayobjects.com/os/basement_prod/6cae02ab-4c29-44b2-b1fd-4005688febcb.json",
        );
        this.data = await result.json();
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

        let previousRect = undefined;
        for (let node of this.data.nodes) {
            const rect = this.addRectToDiagram(node.x, node.y, "#70FF87", node.label);
            if (previousRect) {
                this.addLinkInDiagram(rect, previousRect);
            }
            previousRect = rect;
        }

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
                this.addRectToDiagram(point.x, point.y, node.color, node.name);
            }
            // Reset dragging event
            this.$store.commit("editor/setDragIntoDiagram", false);
        });
    },
    methods: {
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
        /**
         * Adds a rectangle to the diagram
         */
        addRectToDiagram(x: number, y: number, color: string, text: string): GraphRectangle {
            const rect = new GraphRectangle();

            rect.position(x, y);
            rect.resize(100, 60);
            rect.attr({
                body: {
                    fill: color,
                    strokeWidth: 0,
                    rx: 4,
                    ry: 4,
                    cursor: "pointer",
                    class: "node",
                },
                label: {
                    text: text,
                    cursor: "pointer",
                },
            });
            this.graph.addCell(rect);
            return rect;
        },
        /**
         * Adds a link between two rectangles in the diagram
         */
        addLinkInDiagram(rect1: GraphRectangle, rect2: GraphRectangle): void {
            const link = new shapes.standard.Link();
            link.source(rect1);
            link.attr({
                line: {
                    strokeWidth: 4,
                },
            });
            link.target(rect2);
            link.addTo(this.graph);
            link.router("manhattan");
            link.connector("rounded");
        },
    },
});
</script>

<style lang="less">
.node + text {
    color: grey;

    tspan {
        font-size: 20px;
        font-weight: bold;
    }
}
</style>
