<template>
    <div class="content">
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
@import "../../styles/styles.less";

.content {
    width: 100%;
    height: 100%;
    background: @light_grey;
    padding: 32px;
}
</style>
