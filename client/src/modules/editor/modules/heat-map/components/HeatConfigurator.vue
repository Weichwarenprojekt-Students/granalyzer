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
        const heatConfig = this.$store.state.editor.heatMap.labelConfigs.get(this.label.name);
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

                // Only save changes once ever 0.5 seconds
                if (!this.saveChangeTimeoutActive) {
                    this.saveChangeTimeoutActive = true;
                    setTimeout(async () => {
                        this.saveChangeTimeoutActive = false;
                        await this.$store.dispatch("editor/saveChange");
                    }, 500);
                }
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

            // Get heat config that was set in previous step
            const heatConfig = this.$store.state.editor.heatMap.labelConfigs.get(this.label.name);
            if (heatConfig) this.heatConfig = heatConfig;
            else this.heatConfig = {} as HeatConfig;

            // Save changes
            await this.$store.dispatch("editor/saveChange");
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
