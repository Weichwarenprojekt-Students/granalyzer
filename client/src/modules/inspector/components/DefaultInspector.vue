<template>
    <div class="content">
        <div class="underlined-title">{{ $t("inspector.title") }}</div>
        <div class="empty-warning">
            <svg>
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#info`"></use>
            </svg>
            <div class="message">{{ $t("inspector.nothingSelected") }}</div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: "DefaultInspector",
};
</script>

<style lang="less" scoped>
@import "../styles/inspector";

.empty-warning {
    margin: 0;
}
</style>
