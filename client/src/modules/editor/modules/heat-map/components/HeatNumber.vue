<template>
    <div>
        <div class="heat-row red">
            <label>From</label>
            <InputNumber showButtons v-model="config.from" />
        </div>
        <div class="heat-row green">
            <label>To</label>
            <InputNumber showButtons v-model="config.to" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { HeatNumberConfig } from "@/modules/editor/modules/heat-map/models/HeatNumberConfig";

export default defineComponent({
    name: "HeatMapElement",
    props: {
        modelValue: {
            type: Object,
            default: new HeatNumberConfig("", []),
        },
    },
    data() {
        return {
            config: new HeatNumberConfig("", []),
        };
    },
    mounted() {
        this.config = this.modelValue as HeatNumberConfig;
    },
    watch: {
        /**
         * Watch for changes from the outside
         */
        modelValue() {
            this.config = this.modelValue as HeatNumberConfig;
        },
        /**
         * Publish new values
         */
        config: {
            handler() {
                this.$emit("update:modelValue", this.config);
            },
            deep: true,
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global";

.heat-row {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    padding-left: 8px;

    &.red {
        border-left: 4px @heat_from solid;
    }

    &.green {
        border-left: 4px @heat_to solid;
    }
}
</style>
