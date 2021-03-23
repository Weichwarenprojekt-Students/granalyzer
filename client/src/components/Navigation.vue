<template class="navigation">
    <h1>Navigation</h1>
    <router-link to="/">{{ $t("global.start") }}</router-link>
    <router-link to="/editor">{{ $t("global.editor") }}</router-link>
    <router-link to="/inventory">{{ $t("global.inventory") }}</router-link>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "Navigation",
});
</script>

<style lang="less" scoped>
.navigation {
    float: right;
}

a {
    margin-left: 12px;
    margin-right: 12px;
}
</style>
