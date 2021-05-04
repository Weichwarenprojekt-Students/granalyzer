<template>
    <div class="header">
        <h3>{{ $store.state.editor.diagram ? $store.state.editor.diagram.name : "Editor" }}</h3>
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
import { firaSansSVGStyle } from "@/assets/fonts/firasans/FiraSans-Bold-SVG";

export default defineComponent({
    name: "EditorHeader",
    methods: {
        /**
         * Converts the diagram from JointJS to a downloadable binary blob SVG
         */
        exportDiagram() {
            this.$store.commit("editor/centerContent");
            // Hide the selection border in diagram
            this.$store.commit("editor/resetSelection");

            // Embed the FiraSans Bold font into the SVG file
            const styleElement = document.createElementNS("http://www.w3.org/2000/svg", "style");
            styleElement.type = "text/css";
            styleElement.textContent = firaSansSVGStyle;

            // Perform a deep copy of the DOM element
            const svgCopy = document.querySelector("#joint svg").cloneNode(true);
            svgCopy.appendChild(styleElement);
            const blob = new Blob([new XMLSerializer().serializeToString(svgCopy)], {
                type: "image/svg+xml;charset=utf-8",
            });
            saveAs(blob, `${this.$store.state.editor.diagram.name}.svg`);
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
