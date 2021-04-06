<template>
    <div class="content">
        <OverviewList
            class="overview"
            :nodes="$store.state.editor.nodes"
            :labelColor="$store.state.editor.labelColor"
        ></OverviewList>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import OverviewList from "@/modules/editor/modules/overview-list/OverviewList.vue";

export default defineComponent({
    name: "Inventory",
    components: {
        OverviewList,
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.content {
    width: 100%;
    height: 100%;
    background: @light_grey;
    position: relative;

    .overview {
        width: @inventory_width;
        height: 100vh;
        position: relative;
        background: white;
    }
}
</style>
