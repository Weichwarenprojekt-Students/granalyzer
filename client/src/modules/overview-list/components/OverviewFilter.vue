<template>
    <ScrollPanel class="filter">
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
         * Watch filter property for changes to trigger label filtering
         */
        selectedLabels: {
            handler() {
                this.$emit("update:modelValue", this.selectedLabels);
            },
            deep: true,
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.filter {
    margin-top: 8px;
    max-height: 200px;
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 2px solid @light_grey;
}

.row {
    display: flex;
    align-items: center;
    flex-direction: row;
}

.label {
    display: flex;
    align-items: center;
    padding: 10px 0;
    cursor: pointer;
    width: 100%;

    .labelName {
        font-size: 14px;
    }

    .color {
        margin: 0 8px;
        border-radius: 4px;
        width: 16px;
        height: 12px;
    }
}
</style>
