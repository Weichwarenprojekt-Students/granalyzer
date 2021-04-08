<template>
    <div class="content">
        <div class="underlined-title">{{ $t("schemes.conflict-view.title") }}</div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "ConflictView",
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.content {
    height: 100%;
    border-left: 1px solid @grey;
    padding: 0 16px;

    display: flex;
    flex-flow: column;
}

.underlined-title {
    border-bottom: 2px solid @red;
}
</style>
