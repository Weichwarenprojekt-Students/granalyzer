<template>
    <div class="content">
        <div v-if="title" class="underlined-title">{{ $t("inspector.title") }}</div>
        <!-- info message if no element is selected -->
        <div v-if="!visualInfo" class="empty-warning">
            <svg>
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#info`"></use>
            </svg>
            <div class="message">{{ $t("inspector.nothingSelected") }}</div>
        </div>
        <!-- info message if a visual element is selected -->
        <div v-else class="empty-warning">
            <svg>
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#visual`"></use>
            </svg>
            <div class="message">{{ $t("inspector.visualSelected") }}</div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: "DefaultInspector",
    props: {
        // True if the default screen shall include a title
        title: {
            type: Boolean,
            default: true,
        },
        // True if the info for a visual element should be displayed
        visualInfo: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<style lang="less" scoped>
@import "../styles/inspector";

.empty-warning {
    margin: 0;
}
</style>
