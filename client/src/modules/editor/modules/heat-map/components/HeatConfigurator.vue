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
        <HeatEnum v-if="heatConfig.type === heatConfigTypes.ENUM" v-model="heatConfig" class="heat-expand" />
        <HeatNumber v-else-if="heatConfig.type === heatConfigTypes.NUMBER" v-model="heatConfig" class="heat-expand" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ApiLabel from "../../../../../models/data-scheme/ApiLabel";
import { HeatConfig, HeatConfigType } from "@/modules/editor/modules/heat-map/models/HeatConfig";
import HeatNumber from "@/modules/editor/modules/heat-map/components/HeatNumber.vue";
import HeatEnum from "@/modules/editor/modules/heat-map/components/HeatEnum.vue";

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
            // Update timeout active
            saveChangeTimeoutActive: false,
        };
    },
    mounted() {
        // Restore currently active heat config
        const heatConfig = this.$store.state.editor.graphEditor.graphHandler?.heatConfigs.get(this.label.name);
        if (heatConfig) {
            this.heatConfig = heatConfig;
            this.selectedAttribute = heatConfig.attrName;
        }
    },
    watch: {
        /**
         * Update the heat colors if the config changes
         */
        heatConfig: {
            async handler() {
                await this.$store.dispatch("editor/updateHeatColors");

                this.save();
            },
            deep: true,
        },
        /**
         * Check if the user selected a new attribute for the label
         */
        async selectedAttribute() {
            // Set heat config in store
            await this.$store.dispatch("editor/setHeatConfig", {
                labelName: this.label.name,
                attributeName: this.selectedAttribute,
            });
        },
        /**
         * Check if the heat configs have changed
         */
        "$store.state.editor.graphEditor.graphHandler.heatConfigs": {
            async handler() {
                await this.$store.dispatch("editor/updateHeatColors");
                // Get changed heat config
                const heatConfig = this.$store.state.editor.graphEditor.graphHandler?.heatConfigs.get(this.label.name);

                if (heatConfig) {
                    if (heatConfig === this.heatConfig) return;
                    this.heatConfig = heatConfig;
                } else this.heatConfig = {} as HeatConfig;

                // Save changes
                this.save();
            },
            deep: true,
        },
    },
    methods: {
        /**
         * Save after changes to the heat configs
         */
        save(): void {
            // Only save changes once ever 0.5 seconds
            if (!this.saveChangeTimeoutActive) {
                this.saveChangeTimeoutActive = true;
                setTimeout(async () => {
                    await this.$store.dispatch("editor/saveChange");
                    this.saveChangeTimeoutActive = false;
                }, 500);
            }
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global";

.heat-view {
    margin-top: 8px;
    overflow: hidden;
    transition: height 400ms;
}

.heat-header {
    align-items: center;
    padding: 8px 16px;
    display: flex;
    border-bottom: 1px solid @grey;
    justify-content: space-between;
    gap: 12px;

    label {
        font-weight: bold;
        flex: 1 1 auto;
        width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.heat-expand {
    border-bottom: 1px solid @grey;
    padding: 8px 16px;
}
</style>
