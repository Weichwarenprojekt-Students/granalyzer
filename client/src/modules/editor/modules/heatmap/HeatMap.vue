<template>
    <div class="heat-map">
        <div class="underlined-title">{{ $t("editor.heatmap.title") }}</div>
        <HeatView
            v-for="label in $store.state.overview.labels"
            :key="label.name"
            :name="label.name"
        />
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
.heat-map {
    position: absolute;
    bottom: 16px;
    width: 100%;
}

.underlined-title {
    padding: 0;
}
</style>
