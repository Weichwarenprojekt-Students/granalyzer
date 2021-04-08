<template>
    <LabelOverview class="overview" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import LabelOverview from "@/modules/schemes/modules/label-overview/LabelOverview.vue";

export default defineComponent({
    name: "Schemes",
    components: { LabelOverview },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.overview {
    width: @inventory_width;
    height: 100vh;
    flex: 0 0 auto;
    background: white;
}
</style>
