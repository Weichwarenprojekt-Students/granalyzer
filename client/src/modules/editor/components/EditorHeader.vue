<template>
    <div class="header">
        <h3>{{ $store.state.editor.diagram?.name }}</h3>
        <button class="btn btn-secondary" @click="exportDiagram">{{ $t("editor.exportDiagram") }}</button>
    </div>
</template>

<script>
import { defineComponent } from "vue";
import { saveAs } from "file-saver";
import { diagramToSVG } from "@/utility";

export default defineComponent({
    name: "EditorHeader",
    methods: {
        exportDiagram() {
            this.$store.commit("editor/centerContent");
            saveAs(diagramToSVG(document.querySelector("#joint svg")), `${this.$store.state.editor.diagram.name}.svg`);
        },
    },
});
</script>

<style lang="less" scoped>
.header {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

button {
    position: absolute;
    right: 16px;
}
</style>
