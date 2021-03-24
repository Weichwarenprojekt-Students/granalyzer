<template>
    <h2>{{ $t("start.diagrams.title") }}</h2>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "Diagram",
});
</script>

<style lang="less" scoped>
h2 {
    margin-left: 16px;
}
</style>
