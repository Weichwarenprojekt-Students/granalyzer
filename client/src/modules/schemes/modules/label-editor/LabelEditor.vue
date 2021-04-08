<template>
    <div class="content">
        <div class="underlined-title">{{ $t("schemes.label-editor.title") }}</div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "LabelEditor",
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.content {
    height: 100%;
    display: flex;
    flex-flow: column;
}
</style>
