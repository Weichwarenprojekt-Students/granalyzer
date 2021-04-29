<template>
    <div class="header">
        <h3>{{ $store.state.editor.diagram?.name }}</h3>
        <button :disabled="!$store.state.editor.diagram" class="btn btn-secondary btn-icon" @click="exportDiagram">
            <svg>
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#export-bold`"></use>
            </svg>
            {{ $t("editor.exportDiagram") }}
        </button>
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

.btn-icon {
    position: absolute;
    right: 16px;

    svg {
        width: 18px;
        height: 18px;
    }
}
</style>
