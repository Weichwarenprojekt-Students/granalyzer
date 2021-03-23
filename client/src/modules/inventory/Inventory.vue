<template>
    <div id="content">
        <h1>{{ $t("inventory.title") }}</h1>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "Inventory",
});
</script>

<style lang="less" scoped>
@import "../../global.less";

#content {
    margin-left: @navbar_width_collapsed;
}
</style>
