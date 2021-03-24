<template>
    <div id="content">
        <h1>{{ $t("editor.title") }}</h1>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "Editor",
});
</script>

<style lang="less" scoped>
@import "../../styles/global.less";

#content {
    padding: 32px;
    margin-left: @navbar_width_collapsed;
    height: 100vh;
    background: @light_grey;
}
</style>
