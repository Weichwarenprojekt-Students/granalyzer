<template>
    <div :class="['heat-view', { 'heat-view-expanded': !collapsed }]">
        <!-- The Header -->
        <div class="heat-header">
            <svg class="heat-collapse-icon" @click="collapsed = !collapsed">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#arrow`"></use>
            </svg>
            <label>{{ label.name }}</label>
            <div class="heat-spacer" />
            <Dropdown
                :options="label.attributes"
                optionLabel="name"
                oprionValue="name"
                v-model="selectedAttribute"
                showClear
                @change="onChange"
                :placeholder="$t('global.dropdown.choose')"
                :emptyMessage="$t('global.dropdown.empty')"
            />
        </div>

        <!-- The expandable content -->
        <div class="heat-expanded">
            <div class="heat-row">
                <label>From</label>
                <InputNumber showButtons v-model="heatAttribute.from" />
            </div>
            <div class="heat-row">
                <label>To</label>
                <InputNumber showButtons v-model="heatAttribute.to" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ApiLabel from "@/models/data-scheme/ApiLabel";
import { HeatAttribute } from "@/modules/editor/modules/heatmap/models/HeatAttribute";
import {ApiAttribute} from "@/models/data-scheme/ApiAttribute";

export default defineComponent({
    name: "HeatView",
    data() {
        return {
            heatAttribute: {} as HeatAttribute,
            selectedAttribute: {} as ApiAttribute,
            collapsed: false,
        };
    },
    props: {
        label: {
            type: Object,
            default: new ApiLabel(),
        },
    },
    mounted() {
        this.heatAttribute.labelName = this.label.name;
        this.$watch(
            () => [this.heatAttribute.from, this.heatAttribute.to],
            () => {
                this.onChange();
            },
            { deep: true },
        );
    },
    methods: {
        onChange() {
            if (this.heatAttribute.from != null && this.heatAttribute.to != null) {
                this.heatAttribute.selectedAttributeName = this.selectedAttribute?.name;
                this.$emit("change", this.heatAttribute);
            }
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global";

.heat-view {
    margin-bottom: 8px;
    margin-top: 8px;
    overflow: hidden;
    transition: height 400ms;
}

.heat-view-expanded {
    .heat-collapse-icon {
        transform: rotate(90deg);
    }

    .heat-expanded {
        display: flex;
    }
}

.heat-header {
    padding-left: 4px;
    padding-right: 16px;
    align-items: center;
    display: flex;
    border-bottom: 1px solid @grey;

    .heat-spacer {
        flex: 1 1 auto;
    }
}

.heat-collapse-icon {
    line-height: inherit;
    cursor: pointer;
    width: 36px;
    height: 36px;
    padding: 12px;
    fill: @dark;
    transition: transform 400ms;
}

.heat-name {
    width: 100px;
    margin-right: 16px;
}

.heat-expanded {
    margin-left: 60px;
    padding: 0 16px 8px 16px;
    display: none;
    border-bottom: 1px solid @grey;
    transition: height 400ms;
    flex-direction: column;
}

.heat-row {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
}
</style>
