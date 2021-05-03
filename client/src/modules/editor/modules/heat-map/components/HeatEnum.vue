<template>
    <div class="heat-enum">
        <div class="heat-color-preview">
            <div
                v-for="entry in config.values"
                :key="entry"
                :style="{ 'border-right': `4px ${config.valueColors.get(entry)} solid` }"
            />
        </div>
        <ul class="heat-list" ref="enumList">
            <li v-for="entry in config.values" :key="entry" :data-value="entry">
                <svg>
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#drag`"></use>
                </svg>
                {{ entry }}
            </li>
        </ul>
    </div>
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
            const draggedValue = this.config.values.splice(evt.oldIndex, 1)[0];
            this.config.values.splice(evt.newIndex, 0, draggedValue);

            // Update the colors and the v model
            this.config.updateColors();
            this.$emit("update:modelValue", this.config);
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global";

@row_height: 30px;

.heat-enum {
    display: flex;
    flex-direction: row;
    gap: 16px;
}

.heat-color-preview {
    display: flex;
    flex-direction: column;
    gap: 8px;

    div {
        height: @row_height;
    }
}

.heat-list {
    display: flex;
    flex-direction: column;
    gap: 8px;

    li {
        align-items: center;
        display: flex;
        cursor: grab;
        background: white;
        height: @row_height;
        gap: 12px;

        svg {
            width: 14px;
            height: 14px;
            fill: @dark;
        }
    }
}

.heat-drag {
    opacity: 1;
}

.heat-ghost-class {
    opacity: 0;
}
</style>
