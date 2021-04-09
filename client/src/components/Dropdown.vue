<template>
    <div class="dropdown" @click="collapsed = !collapsed">
        <div class="dropdown-value">
            <span>{{ value }}</span>
            <svg class="dropdown-icon">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#dropdown`"></use>
            </svg>
        </div>
        <div v-if="!collapsed" class="dropdown-content">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "Dropdown",
    props: {
        // The value that is shown
        value: {
            type: String,
            default: "",
        },
        // Flag to close content from outside
        forceClose: {
            type: Boolean,
            default: false,
        },
    },
    watch: {
        forceClose() {
            if (this.forceClose) this.collapsed = true;
        },
    },
    data() {
        return {
            collapsed: true,
        };
    },
});
</script>

<style lang="less">
@import "~@/styles/global.less";

.dropdown {
    width: @input_width;
    position: relative;
    display: inline-block;
    background: @light_grey;
    cursor: pointer;
    border-bottom: 1px solid @dark;
}

.dropdown-value {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 12px;
    gap: 24px;

    span {
        color: @dark;
    }
}

.dropdown-icon {
    fill: @dark;
    width: 10px;
    height: 10px;
}

.dropdown-content {
    background: @light_grey;
    position: fixed;
    width: @input_width;
    z-index: 1;
    border-top: 1px solid @dark;
}

.dropdown-content * {
    padding: 6px 12px;

    &:hover {
        background: @accent_color;
    }
}
</style>
