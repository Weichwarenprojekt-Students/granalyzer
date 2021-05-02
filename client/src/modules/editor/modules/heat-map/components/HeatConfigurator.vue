<template>
    <div class="heat-view">
        <!-- The header -->
        <div class="heat-header">
            <label>{{ label.name }}</label>
            <div class="heat-spacer" />
            <Dropdown
                class="dropdown"
                :options="label.attributes"
                optionLabel="name"
                optionValue="name"
                v-model="selectedAttribute"
                :showClear="!!heatConfig.type"
                :placeholder="$t('global.dropdown.choose')"
                :emptyMessage="$t('global.dropdown.empty')"
            />
        </div>

        <!-- The configuration areas -->
        <HeatEnum v-if="heatConfig.type === heatConfigTypes.ENUM" v-model="heatConfig" />
        <HeatNumber v-else-if="heatConfig.type === heatConfigTypes.NUMBER" v-model="heatConfig" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ApiLabel from "../../../../../models/data-scheme/ApiLabel";
import { HeatConfig, HeatConfigType } from "@/modules/editor/modules/heat-map/models/HeatConfig";
import HeatNumber from "@/modules/editor/modules/heat-map/components/HeatNumber.vue";
import HeatEnum from "@/modules/editor/modules/heat-map/components/HeatEnum.vue";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { HeatNumberConfig } from "@/modules/editor/modules/heat-map/models/HeatNumberConfig";
import { allFulfilledPromises } from "@/utility";
import { HeatColorConfig } from "@/modules/editor/modules/heat-map/models/HeatColorConfig";
import { HeatEnumConfig } from "@/modules/editor/modules/heat-map/models/HeatEnumConfig";
import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";
import ApiNode from "@/models/data-scheme/ApiNode";

export default defineComponent({
    name: "HeatConfigurator",
    components: { HeatEnum, HeatNumber },
    props: {
        // The label for which the config will be created
        label: {
            type: Object,
            default: new ApiLabel(),
        },
    },
    data() {
        return {
            // The selected label attribute
            selectedAttribute: "",
            // The possible types
            heatConfigTypes: HeatConfigType,
            // The current config for the label
            heatConfig: {} as HeatConfig,
        };
    },
    watch: {
        /**
         * Update the heat colors if the config changes
         */
        heatConfig: {
            async handler() {
                await this.$store.dispatch("editor/updateHeatColors");
            },
            deep: true,
        },
        /**
         * Check if the user selected a new attribute for the label
         */
        async selectedAttribute() {
            // TODO: comments
            const foundAttr = this.label.attributes.find((attr: ApiAttribute) => attr.name === this.selectedAttribute);
            const newType = foundAttr?.datatype;
            console.log(this.label, this.selectedAttribute, foundAttr);
            const graphHandler: GraphHandler | undefined = this.$store.state.editor.graphEditor.graphHandler;

            if (newType == null || !graphHandler) {
                this.heatConfig = {} as HeatConfig;
                await this.$store.dispatch("editor/deleteHeatConfig", this.label.name);
                return;
            }

            const cachedConfig = graphHandler.heatConfigs.get(`${this.label.name}-${this.selectedAttribute}`);
            if (cachedConfig) {
                this.heatConfig = cachedConfig;
                await this.$store.dispatch("editor/setHeatConfig", { label: this.label.name, config: this.heatConfig });
                return;
            }

            switch (newType) {
                case HeatConfigType.NUMBER: {
                    const nodes = (
                        await allFulfilledPromises(
                            [...graphHandler.nodes]
                                .filter((node) => node.info.label === this.label.name)
                                .map((node) => this.$store.state.editor.heatMap.nodeCache.fetch(node.reference.uuid)),
                        )
                    ).filter((node): node is ApiNode => !!node);

                    this.heatConfig = new HeatNumberConfig(this.selectedAttribute, nodes);
                    break;
                }
                case HeatConfigType.ENUM: {
                    const enumValues: Array<string> | undefined = this.label.attributes.find(
                        (attr: ApiAttribute) => attr.name === this.selectedAttribute,
                    )?.config;
                    if (!enumValues) return;
                    this.heatConfig = new HeatEnumConfig(this.selectedAttribute, enumValues);
                    break;
                }
                case HeatConfigType.COLOR:
                    this.heatConfig = new HeatColorConfig(this.selectedAttribute);
                    break;
                default:
                    return;
            }

            graphHandler.heatConfigs.set(`${this.label.name}-${this.selectedAttribute}`, this.heatConfig);
            await this.$store.dispatch("editor/setHeatConfig", { label: this.label.name, config: this.heatConfig });
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
</style>
