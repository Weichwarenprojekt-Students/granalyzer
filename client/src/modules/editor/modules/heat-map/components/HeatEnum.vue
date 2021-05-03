<template>
    <ul class="heat-enum" ref="enumList">
        <li v-for="entry in config.values" :key="entry" class="heat-row" :data-value="entry">
            <svg :style="{ 'border-right': `4px ${config.valueColors.get(entry)} solid` }">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#drag`"></use>
            </svg>
            {{ entry }}
        </li>
    </ul>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Sortable, { SortableEvent } from "sortablejs";
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
            sort: true,
            animation: 300,
            ghostClass: "heat-ghost-class",
            dragClass: "heat-drag",
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
        onSort(evt: SortableEvent) {
            // Swap the elements
            if (evt.newIndex === undefined || evt.oldIndex === undefined) return;
            [this.config.values[evt.oldIndex], this.config.values[evt.newIndex]] = [
                this.config.values[evt.newIndex],
                this.config.values[evt.oldIndex],
            ];
            // Update the colors and the v model
            this.config.updateColors();
            this.$emit("update:modelValue", this.config);
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global";

.heat-enum {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.heat-row {
    align-items: center;
    display: flex;
    cursor: grab;
    background: white;

    svg {
        width: 26px;
        padding: 8px 8px 8px 0;
        height: 30px;
        fill: @dark;
        margin-right: 8px;
    }
}

.heat-drag {
    opacity: 1;
}

.heat-ghost-class {
    opacity: 0;
}
</style>
