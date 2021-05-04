<template>
    <div class="heat-map">
        <div class="underlined-title">{{ $t("editor.heatMap.title") }}</div>
        <HeatConfigurator v-for="label in $store.state.editor.heatMap.labels" :key="label.name" :label="label" />
    </div>
</template>

<script lang="ts">
import HeatConfigurator from "@/modules/editor/modules/heat-map/components/HeatConfigurator.vue";
import { defineComponent } from "vue";

export default defineComponent({
    name: "HeatMap",
    components: { HeatConfigurator },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global";

.heat-map {
    margin-bottom: 16px;
}

.underlined-title {
    padding: 8px 0;
    height: auto;
    margin-top: 12px;
    border-color: @dark;
}
</style>
