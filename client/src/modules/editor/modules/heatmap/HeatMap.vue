<template>
    <div>
        <div class="underlined-title">{{ $t("editor.heatMap.title") }}</div>
        <HeatMapElement
            v-for="label in $store.state.editor.heatMap.labels"
            :key="label"
            :label="label"
            @change="onChange"
        />
    </div>
</template>

<script lang="ts">
import HeatMapElement from "@/modules/editor/modules/heatmap/components/HeatMapElement.vue";
import { HeatMapAttribute } from "@/modules/editor/modules/heatmap/models/HeatMapAttribute";
import { defineComponent } from "vue";
import ApiNode from "@/models/data-scheme/ApiNode";
import { GET, isUnexpected } from "@/utility";

export default defineComponent({
    name: "HeatMap",
    components: { HeatMapElement },
    mounted() {
        console.log("yellow", this.getLinearColor(1, 10, 5));
        console.log("red", this.getLinearColor(1, 10, 1));
        console.log("green", this.getLinearColor(1, 10, 10));
    },
    methods: {
        async onChange(heatMapAttribute: HeatMapAttribute) {
            const graphHandler = this.$store.state.editor.graphEditor.graphHandler;

            const fetchNodePromises = [];

            for (let node of graphHandler.nodes) {
                if (node.nodeInfo.label === heatMapAttribute.labelName) {
                    fetchNodePromises.push(this.fetchNode(node.nodeInfo.ref.uuid));
                }
            }

            const affectedNodes = (await Promise.allSettled(fetchNodePromises))
                .filter((promise) => promise.status === "fulfilled")
                .map((promise) => (promise as PromiseFulfilledResult<ApiNode>).value);

            for (let node of graphHandler.nodes) {
                // Filter all the nodes affected by the heatmap label name
                if (node.nodeInfo.label === heatMapAttribute.labelName) {
                    const nodeValue = affectedNodes.filter(
                        (affectedNode) => affectedNode.nodeId === node.nodeInfo.ref.uuid,
                    )[0].attributes[heatMapAttribute.selectedAttributeName];

                    // Get new color from gradient
                    const newColor = heatMapAttribute.selectedAttributeName
                        ? this.getLinearColor(
                              heatMapAttribute.from,
                              heatMapAttribute.to,
                              parseFloat(nodeValue.toString()),
                          )
                        : node.nodeInfo.color;

                    // Set new color to node
                    node.jointElement.attr("body/fill", newColor);
                }
            }

            // Save the heatmap attribute to be serialized
            graphHandler.setHeatMapAttribute(heatMapAttribute);
        },

        async fetchNode(uuid: string): Promise<ApiNode | undefined> {
            // Fetch node data
            let result = await GET(`/api/nodes/${uuid}`);
            if (isUnexpected(result)) return;
            return result.json();
        },

        /**
         * Gets the color according a linear gradient red-yellow-green
         */
        getLinearColor(start: number, stop: number, value: number): string {
            // Start and stop boundaries of the gradient
            const startColor = "#F00";
            const endColor = "#0F0";

            // Check if value is outside the given interval
            const outsideBoundaries = this.isOutsideBoundaries(start, stop, value);
            if (outsideBoundaries === 1) return endColor;
            else if (outsideBoundaries === -1) return startColor;

            // Calculate the position of the value on the gradient
            const delta = value >= start ? value - start : value - stop;
            const stepSize = (Math.abs(start - stop) + 1) / 512;
            const amountSteps = Math.floor(delta / stepSize);

            // Helper to fill each hex value to two chars
            const padHex = (hex: string) => (hex.length === 1 ? "0" + hex : hex);

            // Get the according red and green values
            const g = amountSteps > 255 ? "FF" : padHex(amountSteps.toString(16));
            const r = amountSteps > 255 ? padHex((255 - (amountSteps - 256)).toString(16)) : "FF";

            // Concat to final color
            return "#" + r + g + "aa";
        },

        /**
         * Returns 1 if outside stop boundary, and -1 if outside start boundary.
         * 0 is returned if inside the interval
         */
        isOutsideBoundaries(start: number, stop: number, value: number): number {
            if (start < stop) {
                if (value < start) return -1;
                if (value > stop) return 1;
            } else {
                if (value > start) return -1;
                if (value < stop) return 1;
            }

            return 0;
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global";

.underlined-title {
    padding: 8px 0;
    height: auto;
    margin-top: 12px;
    border-color: @dark;
}
</style>
