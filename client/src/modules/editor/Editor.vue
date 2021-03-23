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
@import "../../global.less";

#content {
    margin-left: @navbar_width_collapsed;
}
</style>
