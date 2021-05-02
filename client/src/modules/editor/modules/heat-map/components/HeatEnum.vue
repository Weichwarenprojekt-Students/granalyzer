<template>
    <ul ref="enumList">
        <li
            v-for="entry in config.values"
            :key="entry"
            class="heat-row"
            :style="{ 'border-left': `4px ${config.valueColors.get(entry)} solid` }"
            :data-value="entry"
        >
            <svg>
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#menu`"></use>
            </svg>
            {{ entry }}
        </li>
    </ul>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Sortable from "sortablejs";
import { HeatEnumConfig } from "@/modules/editor/modules/heat-map/models/HeatEnumConfig";

export default defineComponent({
    name: "EnumConfigList",
    props: {
        modelValue: {
            type: Object,
            default: new HeatEnumConfig("", []),
        },
    },
    data() {
        return {
            config: new HeatEnumConfig("", []),
        };
    },
    mounted() {
        // Create the sortable list
        Sortable.create(this.$refs.enumList as HTMLElement, {
            onSort: (evt) => this.onSort(evt),
        });

        // Get the initial value
        this.config = this.modelValue as HeatEnumConfig;
    },
    watch: {
        /**
         * Watch for changes from the outside
         */
        modelValue() {
            this.config = this.modelValue as HeatEnumConfig;
        },
    },
    methods: {
        /**
         * Handle drag events
         */
        // eslint-disable-next-line
        onSort(evt: any) {
            console.log(evt);
            this.config.updateColors();
            this.$emit("update:modelValue", this.config);
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

    svg {
        width: 24px;
        height: 24px;
    }
}
</style>
