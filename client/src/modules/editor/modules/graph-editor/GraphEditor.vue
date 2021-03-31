<template>
    <div id="graphContainer">
        <div id="joint" />
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
            const rect = new GraphRectangle();
            rect.position(node.x, node.y);
            rect.resize(100, 60);
            rect.attr({
                body: {
                    fill: "#70FF87",
                    strokeWidth: 0,
                    rx: 4,
                    ry: 4,
                    cursor: "pointer",
                    class: "node",
                },
                label: {
                    text: node.label,
                    cursor: "pointer",
                },
            });
            rect.addTo(this.graph);
            if (previousRect) {
                const link = new shapes.standard.Link();
                link.source(rect);
                link.attr({
                    line: {
                        strokeWidth: 4,
                    },
                });
                // link.source({ id: rect.id });
                link.target(previousRect);
                link.addTo(this.graph);
                link.router("manhattan");
                link.connector("rounded");
            }
            previousRect = rect;
        }
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
