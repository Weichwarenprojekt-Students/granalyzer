<template>
    <div class="container" @mousemove="graph.mousemove">
        <div id="joint" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { JointGraph } from "@/shared/JointGraph";

export default defineComponent({
    name: "NeighborView",
    data() {
        return {
            graph: {} as JointGraph,
        };
    },
    mounted(): void {
        // Set up the graph and the controls
        this.graph = new JointGraph("joint");
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global";

.container {
    position: relative;
    background: #f2f2f2;
}
</style>
