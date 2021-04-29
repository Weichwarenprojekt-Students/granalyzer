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
import {HeatMapUtils} from "@/modules/editor/modules/heatmap/controls/HeatMapUtils";

export default defineComponent({
    name: "HeatMap",
    components: { HeatMapElement },
    methods: {
        async onChange(heatMapAttribute: HeatMapAttribute) {
            if (heatMapAttribute.selectedAttributeName) {
                // Set the heatmap colors according the selection
                await this.$store.dispatch("editor/heatMap/setHeatmapColor", heatMapAttribute)
            } else {
                this.$store.dispatch("editor/heatMap/resetHeatmapColor", heatMapAttribute)
            }
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