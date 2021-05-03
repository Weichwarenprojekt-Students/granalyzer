<template>
    <ScrollPanel ref="scroll" :class="['filter', { 'filter-expanded': expanded }]">
        <div class="row" v-for="label in labels" :key="label.name">
            <Checkbox v-model="selectedLabels" :value="label.name" :id="label.name" />
            <label class="label" :for="label.name">
                <span class="checkmark"></span>
                <span class="color" :style="{ background: labelColors.get(label.name).color }"></span>
                <span class="labelName">{{ label.name }}</span>
            </label>
        </div>
    </ScrollPanel>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "OverviewFilter",
    props: {
        // Labels to visualize in the filter
        labels: Array,
        // Colors for the filter labels
        labelColors: Object,
        // The filter
        modelValue: Array,
        // True if the filter shall be expanded
        expanded: Boolean,
    },
    data() {
        return {
            // Labels to filter by
            selectedLabels: [] as Array<string>,
        };
    },
    mounted() {
        this.selectedLabels = (this.modelValue as string[]) ?? [];
    },
    watch: {
        /**
         * Check if the filter was expanded and start updating the view
         * (necessary for scroll panel to update)
         */
        expanded() {
            if (this.expanded) this.refresh();
        },
        /**
         * Watch filter property for changes to trigger label filtering
         */
        selectedLabels: {
            handler() {
                this.$emit("update:modelValue", this.selectedLabels);
            },
            deep: true,
        },
    },
    methods: {
        /**
         * Refresh the view (necessary for scroll panel)
         */
        refresh(start: number = Date.now()): void {
            this.$forceUpdate();
            if (Date.now() - start < 400) window.requestAnimationFrame(() => this.refresh(start));
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.filter {
    max-height: 0;
    transition: all 400ms;
    margin-bottom: 8px;
    border-bottom: 2px solid @grey;
    height: auto !important;
}

.filter-expanded {
    max-height: 200px;
    padding-bottom: 8px;
}

.row {
    display: flex;
    align-items: center;
    flex-direction: row;
    overflow: hidden;
}

.label {
    display: flex;
    align-items: center;
    padding: 10px 0;
    cursor: pointer;
    width: 100%;
    overflow: hidden;

    .labelName {
        font-size: 14px;
        flex: 1 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding-right: 16px;
    }

    .color {
        flex: 0 0 auto;
        margin: 0 8px;
        border-radius: 4px;
        width: 16px;
        height: 12px;
    }
}
</style>
