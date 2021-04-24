<template>
    <!-- Expand the base dialog -->
    <BaseDialog :show="show" @confirm="checkInput">
        <div class="mid-section">
            <div class="selection">
                <!-- Title -->
                <h1>{{ $t("inventory.dialog.title") }}</h1>

                <div class="direction">
                    <div class="flex-wrapper">
                        <!-- From -->
                        <div class="direction-item">
                            <div class="text">
                                {{ switched ? $t("inventory.dialog.to") : $t("inventory.dialog.from") }}
                            </div>
                            <div class="node">{{ fromNode.name }}</div>
                        </div>

                        <!-- To -->
                        <div class="direction-item">
                            <div class="text">
                                {{ switched ? $t("inventory.dialog.from") : $t("inventory.dialog.to") }}
                            </div>
                            <Dropdown
                                class="dropdown"
                                v-model="selectedNode"
                                :options="toNodes.map((node) => node.name).filter((node) => node !== fromNode.name)"
                                :placeholder="$t('inventory.dialog.dropdown.neighbor.placeholder')"
                                :emptyMessage="$t('inventory.dialog.dropdown.neighbor.empty')"
                            />
                        </div>
                    </div>

                    <!-- Switch -->
                    <svg class="icon-reload" @click="switchDirection">
                        <use :xlink:href="`${require('@/assets/img/icons.svg')}#reload`"></use>
                    </svg>
                </div>

                <div class="type">
                    <div class="text">{{ $t("inventory.dialog.type") }}</div>
                    <Dropdown
                        class="dropdown"
                        v-model="selectedRelationType"
                        :options="possibleRelationTypes"
                        :placeholder="$t('inventory.dialog.dropdown.type.placeholder')"
                        :emptyMessage="$t('inventory.dialog.dropdown.type.empty')"
                    />
                </div>
            </div>
        </div>
    </BaseDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseDialog from "@/components/dialog/BaseDialog.vue";
import { errorToast } from "@/utility";
import ApiNode from "@/models/data-scheme/ApiNode";
import ApiRelation from "@/models/data-scheme/ApiRelation";

export default defineComponent({
    name: "DropdownDialog",
    components: {
        BaseDialog,
    },
    props: {
        // True if the dialog should be shown
        show: Boolean,
        // Node that the relation comes from
        fromNode: Object,
        // Node that the relation goes to
        toNodes: Array,
    },
    data() {
        return {
            // Relation-dropdown selection
            selectedRelationType: null,
            // Node-dropdown selection
            selectedNode: null,
            // Possible relation types
            possibleRelationTypes: null,
            // True, if direction of relation was switched
            switched: false,
        };
    },
    watch: {
        /**
         * Reset dialog state
         */
        show(visible) {
            if (!visible) return;
            this.selectedRelationType = null;
            this.selectedNode = null;

            const origin = this.$store.state.inventory.selectedNode.name;
            if (origin !== this.fromNode?.name) {
                this.selectedNode = origin;
                this.updatePossibleRelationTypes();
            }

            this.switched = false;
        },
        /**
         * Check possible relation types
         */
        selectedNode() {
            this.updatePossibleRelationTypes();
        },
    },
    methods: {
        /**
         * Switch the direction of the relation
         */
        switchDirection() {
            this.switched = !this.switched;
            this.selectedRelationType = null;
            this.updatePossibleRelationTypes();
        },
        /**
         * Check for valid relation types
         */
        async updatePossibleRelationTypes(): Promise<void> {
            if (!this.fromNode || !this.selectedNode) return;

            let from = this.fromNode.label;
            let to = (this.toNodes as Array<ApiNode>).find((node) => node.name == this.selectedNode)?.label;
            if (this.switched) [from, to] = [to, from];

            this.possibleRelationTypes = await this.$store.dispatch("inventory/getPossibleRelationTypes", {
                fromLabel: from,
                toLabel: to,
            });
        },
        /**
         * Check if dialog input is valid
         */
        checkInput(): void {
            if (this.selectedRelationType && this.selectedNode) {
                const selection = (this.toNodes as Array<ApiNode>).find(
                    (node: ApiNode) => node.name == this.selectedNode,
                ) as ApiNode;

                this.$emit(
                    "input-confirm",
                    new ApiRelation(
                        this.switched ? selection.nodeId : (this.fromNode as ApiNode).nodeId,
                        this.switched ? (this.fromNode as ApiNode).nodeId : selection.nodeId,
                        this.selectedRelationType ?? "",
                    ),
                );
            } else if (!this.selectedRelationType) {
                errorToast(
                    this.$t("inventory.dialog.emptyLabel.title"),
                    this.$t("inventory.dialog.emptyLabel.description"),
                );
            } else if (!this.selectedNode) {
                errorToast(
                    this.$t("inventory.dialog.emptyNode.title"),
                    this.$t("inventory.dialog.emptyNode.description"),
                );
            }
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global";

@input_width: 360px;

.mid-section {
    position: relative;
    padding: 32px;
    border-top: 8px solid @primary_color;
    display: flex;
    align-items: center;
    width: 512px;

    .selection {
        display: flex;
        flex-direction: column;
        width: 100%;
    }
}

.text {
    width: 40px;
    font-style: italic;
    font-size: @normal_text;
}

.dropdown {
    width: @input_width;
}

.direction {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;

    .direction-item {
        display: flex;
        align-items: center;
        padding-right: 8px;
        margin-top: 4px;

        .node {
            border-bottom: 1px solid @grey;

            width: @input_width;
            padding: 8px;

            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }

    .icon-reload {
        fill: @dark;
        height: 24px;
        width: 24px;
        cursor: pointer;
    }
}

.type {
    display: flex;
    align-items: center;
    margin-top: 16px;
}
</style>
