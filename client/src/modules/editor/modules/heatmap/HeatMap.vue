<template>
    <div>
        <div class="underlined-title">{{ $t("editor.heatMap.title") }}</div>
        <HeatView v-for="label in $store.state.editor.heatMap.labels" :key="label" :label="label" />
    </div>
</template>

<script>
import HeatView from "@/modules/editor/modules/heatmap/components/HeatView";

export default {
    name: "HeatMap",
    components: { HeatView },
};
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
