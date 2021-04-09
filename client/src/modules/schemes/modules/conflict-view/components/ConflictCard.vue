<template>
    <div class="conflict-card">
        <svg class="conflict-icon">
            <use :xlink:href="`${require('@/assets/img/icons.svg')}#warning`"></use>
        </svg>
        <div class="conflict-content">
            <span>{{ conflict.title }}</span>
            <span class="conflict-description">{{ conflict.description }}</span>
            <div class="conflict-actions">
                <a class="conflict-remove" v-tooltip.top="$t('schemes.conflict-view.revert')">
                    <svg class="conflict-remove">
                        <use :xlink:href="`${require('@/assets/img/icons.svg')}#revert`"></use>
                    </svg>
                </a>
                <a class="conflict-remove" v-tooltip.top="$t('schemes.conflict-view.check')">
                    <svg class="conflict-remove">
                        <use :xlink:href="`${require('@/assets/img/icons.svg')}#check`"></use>
                    </svg>
                </a>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Conflict } from "@/modules/schemes/modules/conflict-view/models/Conflict";

export default defineComponent({
    name: "ConflictCard",
    props: {
        conflict: {
            type: Object,
            default: new Conflict(),
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.conflict-icon {
    width: 64px;
    height: 64px;
    fill: @red;
    margin-right: 24px;
}

.conflict-card {
    padding: 24px 12px;
    border-bottom: 1px solid @grey;
    display: flex;
    align-items: center;
    flex-direction: row;
}

.conflict-content {
    display: flex;
    flex-direction: column;
}

.conflict-actions {
    fill: @dark;
    display: flex;
    flex-direction: row;
    gap: 12px;
    align-items: center;
}

.conflict-button {
    font-size: @description;
    padding: 2px 4px;
    width: auto;
}

.conflict-remove {
    height: 16px;
    width: 16px;
    cursor: pointer;
}

.conflict-description {
    margin-top: 8px;
    margin-bottom: 12px;
    font-size: @description;
}
</style>
