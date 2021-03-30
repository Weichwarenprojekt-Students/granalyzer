<template>
    <div id="graphCanvas">
        <button @click="onClick" class="button btn btn-normal">Add Node</button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Graph } from "@antv/g6";
import { Diagram } from "@/modules/editor/modules/graph-editor/models/Diagram";
import { GET } from "@/utility";

export default defineComponent({
    name: "GraphEditor",
    data() {
        return {
            graph: {} as Graph,
            diagData: {} as Diagram,
        };
    },
    async mounted(): Promise<void> {
        // Get the mock data
        const result = await GET(
            "https://gw.alipayobjects.com/os/basement_prod/6cae02ab-4c29-44b2-b1fd-4005688febcb.json",
        );
        this.diagData = await result.json();

        // Initialize the graph
        this.initGraph();
        this.resizeGraph();
        this.graph.data(this.diagData);
        this.graph.render();

        window.addEventListener("resize", this.resizeGraph);
    },
    unmounted() {
        window.removeEventListener("resize", this.resizeGraph);
    },
    methods: {
        /**
         * Resize the graph on resize events
         */
        resizeGraph(): void {
            const canvas = document.getElementById("graphCanvas");
            if (canvas != null) this.graph.changeSize(canvas.clientWidth, canvas.clientHeight);
        },
        /**
         * Initialize the graph
         */
        initGraph(): void {
            const defaultNode = {
                size: 50,

                type: "rect",

                style: {
                    radius: 4,
                    fill: "#FFA726",
                },

                labelCfg: {
                    style: {
                        fontSize: 30,
                        fill: "#fff",
                    },
                },
            };

            const defaultEdge = {
                type: "polyline",
                style: {
                    stroke: "#000",
                    lineWidth: 3,
                },
                labelCfg: {
                    autoRotate: true,

                    refX: 20,
                    refY: 20,

                    style: {
                        fontSize: 25,
                        fontWeight: "bold",
                    },
                },
            };

            const nodeStateStyles = {
                hover: {
                    fill: "#FFA726",
                },

                click: {
                    stroke: "#000",
                    lineWidth: 3,
                },
            };

            const edgeStateStyles = {
                click: {
                    stroke: "#FFA726",
                },
            };

            const modes = {
                default: ["drag-canvas", "zoom-canvas", "drag-node"],
            };

            const graphConf = {
                defaultNode,
                defaultEdge,
                nodeStateStyles,
                edgeStateStyles,
                modes,
                container: "graphCanvas",
                width: 0,
                height: 0,
                fitView: true,
                fitViewPadding: [64, 64, 64, 64],
            };

            this.graph = new Graph(graphConf);

            this.registerEventHandlers();
        },

        /**
         * Generates value between min and min + width
         */
        randomRangeValue(width: number, min: number): number {
            return Math.floor(Math.random() * (width + 1) + min);
        },

        registerEventHandlers(): void {
            this.graph.on("node:click", () => {
                alert("You clicked a node!");
            });

            this.graph.on("edge:click", () => {
                alert("You clicked an edge!");
            });
        },

        /**
         * Add a node to the diagram
         */
        addNode(uuid: string, label: string, displayName: string, color: string, xPos: number, yPos: number): void {
            const newNode = {
                x: xPos,
                y: yPos,
                size: 100,
                id: uuid,
                label: displayName,
                labelType: label,
                type: "rect",

                style: {
                    radius: 5,
                    fill: color,
                    stroke: "#000",
                    lineWidth: 2,
                },

                labelCfg: {
                    style: {
                        fontSize: 30,
                        fill: "#fff",
                    },
                },
            };

            // Add the item to the diagram and re-render the diagram
            this.graph.addItem("node", newNode);
        },

        /**
         * Add node on click
         */
        onClick(): void {
            this.addNode(
                Math.floor(Math.random() * Math.floor(10000)).toString(),
                "Movie",
                "The Polar Express",
                "#FFA726",
                0,
                0,
            );
        },
    },
});
</script>

<style scoped>
.button {
    position: absolute;
    top: 32px;
    right: 32px;
}
</style>
