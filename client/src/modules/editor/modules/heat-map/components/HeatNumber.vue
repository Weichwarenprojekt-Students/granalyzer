<template>
    <div class="heat-number">
        <div class="heat-row red">
            <label>From</label>
            <NumberInput v-model="config.from" :placeholder="$t('global.input.placeholder')" />
        </div>
        <div class="heat-row green">
            <label>To</label>
            <NumberInput v-model="config.to" :placeholder="$t('global.input.placeholder')" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { HeatNumberConfig } from "@/modules/editor/modules/heat-map/models/HeatNumberConfig";
import NumberInput from "@/components/NumberInput.vue";

export default defineComponent({
    name: "HeatMapElement",
    components: { NumberInput },
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

.heat-number {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.heat-row {
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding-left: 16px;

    &.red {
        border-left: 4px @heat_from solid;
    }

    &.green {
        border-left: 4px @heat_to solid;
    }
}
</style>
