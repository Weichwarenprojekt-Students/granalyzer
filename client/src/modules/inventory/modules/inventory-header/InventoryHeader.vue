<template>
    <div class="header">
        <h3>{{ $t("inventory.title") }}</h3>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "InventoryHeader",
});
</script>

<style lang="less" scoped>
.header {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
