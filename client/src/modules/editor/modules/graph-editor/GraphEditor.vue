<template>
    <div id="graphCanvas">
        <button @click="onClick()">Add new test node</button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Graph, GraphData } from "@antv/g6";

export default defineComponent({
    name: "GraphEditor",
    data() {
        return {
            graph: {} as Graph,
            diagData: {} as GraphData,
        };
    },
    async mounted(): Promise<void> {
        const result = await fetch(
            "https://gw.alipayobjects.com/os/basement_prod/6cae02ab-4c29-44b2-b1fd-4005688febcb.json",
        );
        const remoteData = await result.json();

        this.initGraph();
        this.loadDiagram(remoteData);
        this.resizeGraph();
        this.drawGraph();

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
                    radius: 5,
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
                fitViewPadding: [20, 40, 50, 20],
            };

            this.graph = new Graph(graphConf);

            this.registerEventHandlers();
        },

        /**
         * Generates value between min and min + width
         *
         * @private
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

        loadDiagram(diagData: GraphData): void {
            this.diagData = diagData;
            this.graph.data(this.diagData);
        },

        drawGraph(): void {
            this.graph.render();
        },

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

<style scoped></style>
