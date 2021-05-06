<template>
    <div class="heat-enum">
        <div class="heat-color-preview">
            <div
                v-for="entry in config.values"
                :key="entry"
                :style="{ 'border-right': `4px ${config.valueColors.get(entry)} solid` }"
            />
        </div>
        <div class="heat-list" ref="enumList">
            <div v-for="entry in config.values" :data-value="entry" :key="entry">
                <svg>
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#drag`"></use>
                </svg>
                <span>{{ entry }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Sortable from "sortablejs";
import { HeatEnumConfig } from "@/modules/editor/modules/heat-map/models/HeatEnumConfig";

export default defineComponent({
    name: "EnumConfigList",
    props: {
        // Enum config
        modelValue: {
            type: Object,
            default: new HeatEnumConfig("", []),
        },
    },
    data() {
        return {
            // The modified config
            config: new HeatEnumConfig("", []),
            // The sortable object
            sortable: {} as Sortable,
        };
    },
    mounted() {
        // Create the sortable list
        this.sortable = Sortable.create(this.$refs.enumList as HTMLElement, {
            animation: 300,
            ghostClass: "heat-ghost-class",
            dragClass: "heat-drag",
            onSort: this.onSort,
            dataIdAttr: "data-value",
        });

        // Get the initial value
        this.config = this.modelValue as HeatEnumConfig;
    },
    methods: {
        /**
         * Handle drag events
         */
        onSort() {
            this.config.values = this.sortable.toArray();
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
    flex: 1 1 auto;

    div {
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
            flex: 0 0 auto;
        }

        span {
            width: 0;
            flex: 1 1 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
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
