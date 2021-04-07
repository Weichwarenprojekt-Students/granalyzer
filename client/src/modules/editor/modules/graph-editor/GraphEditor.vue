<template>
    <div class="container" @mousemove="graph.mousemove">
        <ProgressBar v-show="$store.state.editor.graphEditor.editorLoading" mode="indeterminate" class="loading" />
        <Toolbar v-show="!$store.state.editor.graphEditor.editorLoading" />
        <div
            id="joint"
            :class="{ disabled: $store.state.editor.graphEditor.editorLoading }"
            @dragover.prevent
            @drop.stop.prevent
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { GraphHandler } from "./controls/GraphHandler";
import { isEmpty } from "@/utility";
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
        // Set up the graph and the controls
        this.graph = new JointGraph("joint");
        this.$store.commit("editor/setGraphHandler", new GraphHandler(this.$store, this.graph));

        // Load the active diagram
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
});
</script>

<style lang="less">
@import "~@/styles/global";

.container {
    position: relative;
}

.loading {
    position: absolute;
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
    fill: @dark;

    tspan {
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
    }
}

.label {
    cursor: pointer;

    text {
        fill: white;

        tspan {
            font-size: 14px;
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
