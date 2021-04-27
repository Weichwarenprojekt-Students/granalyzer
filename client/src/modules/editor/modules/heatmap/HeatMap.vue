<template>
    <div>
        <div class="underlined-title">{{ $t("editor.heatMap.title") }}</div>
        <HeatView
            v-for="label in $store.state.editor.heatMap.labels"
            :key="label"
            :label="label"
            @change="onChange"
        />
    </div>
</template>

<script lang="ts">

import HeatView from "@/modules/editor/modules/heatmap/components/HeatView.vue";
import {HeatAttribute} from "@/modules/editor/modules/heatmap/models/HeatAttribute";

export default {
    name: "HeatMap",
    components: { HeatView },
    methods: {
        onChange(attr:HeatAttribute) {
            console.log(attr);
        }
    }
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