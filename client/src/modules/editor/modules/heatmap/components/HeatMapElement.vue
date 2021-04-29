<template>
    <div :class="['heat-view', { 'heat-view-expanded': !collapsed }]">
        <!-- The Header -->
        <div class="heat-header">
            <svg class="heat-collapse-icon" @click="toggleCollapse">
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
        <div class="heat-expanded" v-if="selectedAttribute !== null && selectedAttribute.datatype === types.NUMBER">
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
import { HeatMapAttribute } from "@/modules/editor/modules/heatmap/models/HeatMapAttribute";
import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";
import { ApiDatatype } from "@/models/data-scheme/ApiDatatype";

export default defineComponent({
    name: "HeatMapElement",
    data() {
        return {
            heatAttribute: {} as HeatMapAttribute,
            selectedAttribute: {} as ApiAttribute,
            collapsed: false,
            types: ApiDatatype,
        };
    },
    props: {
        label: {
            type: Object,
            default: new ApiLabel(),
        },
    },
    mounted() {
        this.heatAttribute = new HeatMapAttribute(this.label.name, null);

        // Check if the input fields are field with numbers
        this.$watch(
            () => [this.heatAttribute.from, this.heatAttribute.to],
            () => this.onChange(),
        );
    },
    methods: {
        /**
         * Check if the input fields are field with numbers
         */
        onChange() {
            if (!this.selectedAttribute) {
                this.collapsed = true;
            }

            this.heatAttribute.selectedAttributeName = this.selectedAttribute?.name;
            this.$emit("change", this.heatAttribute);
        },

        /**
         * Toggle the expandable
         */
        toggleCollapse() {
            if (!this.selectedAttribute) return;
            this.collapsed = !this.collapsed;
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
