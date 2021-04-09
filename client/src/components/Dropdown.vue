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
    background: @dark;
    cursor: pointer;
    border-radius: @border_radius;
}

.dropdown-value {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 16px;
    gap: 24px;

    span {
        color: white;
    }
}

.dropdown-icon {
    fill: white;
    width: 10px;
    height: 10px;
}

.dropdown-content {
    background: white;
    position: fixed;
    width: @input_width;
    z-index: 1;
    border: 1px solid @grey;
    border-radius: @border_radius;
}

.dropdown-content * {
    padding: 6px 16px;

    &:hover {
        background: @grey;
    }
}
</style>
