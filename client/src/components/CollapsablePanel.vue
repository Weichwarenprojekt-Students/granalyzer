<template>
    <div class="collapsable-panel-wrapper">
        <!-- For left sided panels -->
        <svg
            v-if="left"
            :class="[
                'collapsable-left-button',
                { 'collapsed-left-button': collapsePanel },
                { 'collapsed-button-force': forceCollapse },
            ]"
            @click="togglePanel"
        >
            <use :xlink:href="`${require('@/assets/img/icons.svg')}#arrow`"></use>
        </svg>
        <div
            v-if="left"
            :class="[
                'collapsable-panel',
                'collapsable-panel-left',
                { 'collapsed-panel': collapsePanel },
                { 'collapsed-panel-force': forceCollapse },
            ]"
        >
            <slot />
        </div>

        <!-- For right sided panels -->
        <svg
            v-if="!left"
            :class="[
                'collapsable-right-button',
                { 'collapsed-right-button': collapsePanel },
                { 'collapsed-button-force': forceCollapse },
            ]"
            @click="togglePanel"
        >
            <use :xlink:href="`${require('@/assets/img/icons.svg')}#arrow`"></use>
        </svg>
        <div
            v-if="!left"
            :class="[
                'collapsable-panel',
                'collapsable-panel-right',
                { 'collapsed-panel': collapsePanel },
                { 'collapsed-panel-force': forceCollapse },
            ]"
        >
            <slot />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { reactive } from "vue";

/**
 * The global state of the panels
 */
const panels = reactive({
    left: false,
    right: false,
});

/**
 * Update the sidebar state
 */
const updatePanelState = (): void => {
    const collapse = window.innerWidth < 1300;
    panels.left = collapse;
    panels.right = collapse;
};

// Listen for resize events to update the panel states
window.addEventListener("resize", updatePanelState);
updatePanelState();

export default defineComponent({
    name: "CollapsablePanel",
    props: {
        // True if the panel shall be shown on the left
        left: Boolean,
        // True if the panel shall be forced to collapse
        forceCollapse: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        /**
         * @return True if the panel should be collapsed
         */
        collapsePanel(): boolean {
            return (this.left ? panels.left : panels.right) || this.forceCollapse;
        },
    },
    methods: {
        /**
         * Toggle the panel collapse state
         */
        togglePanel(): void {
            if (this.left) panels.left = !panels.left;
            else panels.right = !panels.right;
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global";

.collapsable-panel-wrapper {
    position: relative;
    height: 100vh;
    flex: 0 0 auto;
}

.collapsable-panel {
    background: white;
    transition: width @navbar_animation_time;
    width: @side_panel_width;
    overflow: hidden;
    height: 100%;
}

.collapsed-panel {
    width: 16px;
}

.collapsed-panel-force {
    transition: none;
}

.collapsable-panel-left {
    border-right: 1px solid @grey;
}

.collapsable-panel-right {
    border-left: 1px solid @grey;
}

@collapse_icon_size: 26px;
.collapsable-button {
    cursor: pointer;
    z-index: 300;
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto;
    width: @collapse_icon_size;
    height: @collapse_icon_size;
    padding: 8px;
    border-radius: 18px;
    transition: all @navbar_animation_time;
    background: @secondary_color;
    fill: @dark;
}

.collapsable-left-button {
    .collapsable-button();
    transform: rotate(180deg);
    right: -@collapse_icon_size / 2;
}

.collapsable-right-button {
    .collapsable-button();
    left: -@collapse_icon_size / 2;
}

.collapsed-button-force {
    transition: none;
    pointer-events: none;
    background: @grey;
}

.collapsed-left-button {
    transform: rotate(0deg);
}

.collapsed-right-button {
    transform: rotate(180deg);
}
</style>
