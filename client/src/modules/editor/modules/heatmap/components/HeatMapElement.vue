<template>
    <div :class="['heat-view', { 'heat-view-expanded': !collapsed }]">
        <!-- The Header -->
        <div class="heat-header">
            <label>{{ label.name }}</label>
            <div class="heat-spacer" />
            <Dropdown
                class="dropdown"
                :options="label.attributes"
                optionLabel="name"
                v-model="selectedAttribute"
                :showClear="!collapsed"
                @change="onChange"
                :placeholder="$t('global.dropdown.choose')"
                :emptyMessage="$t('global.dropdown.empty')"
            />
        </div>

        <!-- The expandable content for number attributes -->
        <div class="heat-expanded" v-if="!collapsed && selectedAttribute?.datatype === types.NUMBER">
            <div class="heat-row red">
                <label>From</label>
                <InputNumber showButtons v-model="heatAttribute.from" />
            </div>
            <div class="heat-row green">
                <label>To</label>
                <InputNumber showButtons v-model="heatAttribute.to" />
            </div>
        </div>

        <!-- The expandable content for enum attributes -->
        <div v-if="!collapsed && selectedAttribute.datatype === types.ENUM">
            <EnumConfigList v-model:config="selectedAttribute.config" @change="onChange" />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ApiLabel from "@/models/data-scheme/ApiLabel";
import { HeatMapAttribute } from "@/modules/editor/modules/heatmap/models/HeatMapAttribute";
import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";
import { ApiDatatype } from "@/models/data-scheme/ApiDatatype";
import ApiNode from "@/models/data-scheme/ApiNode";
import EnumConfigList from "@/modules/editor/modules/heatmap/components/EnumConfigList.vue";

export default defineComponent({
    name: "HeatMapElement",
    components: { EnumConfigList },
    data() {
        return {
            heatAttribute: {} as HeatMapAttribute,
            selectedAttribute: {} as ApiAttribute,
            collapsed: true,
            types: ApiDatatype,
            affectedNodes: [] as Array<ApiNode>,
        };
    },
    props: {
        label: {
            type: Object,
            default: new ApiLabel(),
        },
    },
    async mounted() {
        // Restore already configured heatmap attribute if available
        const heatMapAttribute: HeatMapAttribute = await this.$store.dispatch(
            "editor/heatMap/getHeatMapAttribute",
            this.label.name,
        );
        this.heatAttribute = heatMapAttribute ?? new HeatMapAttribute(this.label.name, null);
        if (this.heatAttribute.selectedAttribute)
            this.selectedAttribute = (this.label as ApiLabel).attributes.filter(
                (attribute) => attribute.name === this.heatAttribute.selectedAttribute?.name,
            )[0];

        this.collapsed = !this.heatAttribute.selectedAttribute?.name;

        // Fetch the nodes belonging to the specific label
        this.affectedNodes = await this.$store.dispatch("editor/heatMap/fetchAffectedNodes", this.heatAttribute);

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
            this.heatAttribute.selectedAttribute = this.selectedAttribute;
            this.collapsed = !this.heatAttribute.selectedAttribute;

            // Assign the min and max value of all nodes by default
            if (!this.collapsed && (!this.heatAttribute.from || !this.heatAttribute.to)) {
                const [min, max] = this.getMaxMinOfHeatAttribute();
                if (!this.heatAttribute.from) this.heatAttribute.from = min;
                if (!this.heatAttribute.to) this.heatAttribute.to = max;
            }

            this.$emit("change", this.heatAttribute);
        },

        /**
         * Returns the min and max value of the selected attribute
         */
        getMaxMinOfHeatAttribute(): [number, number] {
            let attributeValues: number[];
            switch (this.selectedAttribute.datatype) {
                case ApiDatatype.ENUM:
                    return [0, this.selectedAttribute.config.length - 1];
                case ApiDatatype.NUMBER:
                default:
                    attributeValues = this.affectedNodes
                        .map((node) => node.attributes[this.selectedAttribute.name])
                        .filter((attribute): attribute is number => !!attribute);
                    return [Math.min(...attributeValues), Math.max(...attributeValues)];
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

    .dropdown {
        margin-bottom: 4px;
    }
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
    padding-left: 8px;

    &.red {
        border-left: 4px red solid;
    }

    &.green {
        border-left: 4px green solid;
    }
}

.color {
    width: 8px;
    height: 8px;

    &.red {
        background-color: red;
    }

    &.green {
        background-color: green;
    }
}

.heat-expanded-enum .heat-row {
    &:first-of-type {
        border-top: 4px red solid;
        padding-top: 4px;
    }

    &:last-of-type {
        border-bottom: 4px green solid;
        padding-bottom: 4px;
    }
}
</style>
