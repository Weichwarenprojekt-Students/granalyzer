<template>
    <div class="node" @click="onClick">{{ label }}</div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
    name: "OverviewItem",
    props: {
        label: String,
    },
    methods: {
        onClick() {
            console.log("Clicked");
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/styles.less";

.node {
    height: 64px;
    padding-left: 16px;

    display: flex;
    align-items: center;

    font-size: @h2;

    border-bottom: 1px solid @grey;

    &:hover {
        background: @accent_color;
    }
}
</style>
