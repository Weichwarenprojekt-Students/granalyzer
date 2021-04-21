<template>
    <!-- Expand the base dialog -->
    <BaseDialog :show="show" @confirm="checkInput">
        <div class="mid-section">
            <div class="selection">
                <!-- Title -->
                <h1>{{ $t("inventory.dialog.title") }}</h1>

                <!-- TODO :: style with grid instead of flexbox -->
                <!-- Relation-direction selection -->
                <div class="direction">
                    <!-- From To -->
                    <div class="flex-wrapper">
                        <div class="fromTo">
                            <div class="text">
                                {{ switched ? $t("inventory.dialog.to") : $t("inventory.dialog.from") }}
                            </div>
                            <div class="node">{{ fromNode.name }}</div>
                        </div>
                        <div class="fromTo">
                            <div class="text">
                                {{ switched ? $t("inventory.dialog.from") : $t("inventory.dialog.to") }}
                            </div>
                            <Dropdown
                                class="dropdown-relation"
                                v-model="selectedNode"
                                :options="toNodes.map((node) => node.name).filter((node) => node !== fromNode.name)"
                                :placeholder="$t('inventory.dialog.dropdown.neighbor.placeholder')"
                                :emptyMessage="$t('inventory.dialog.dropdown.neighbor.empty')"
                            />
                        </div>
                    </div>

                    <!-- Switch icon -->
                    <svg class="icon-reload" @click="switchDirection">
                        <use :xlink:href="`${require('@/assets/img/icons.svg')}#reload`"></use>
                    </svg>
                </div>

                <!-- Type selection -->
                <div class="type">
                    <div class="text">{{ $t("inventory.dialog.type") }}</div>
                    <Dropdown
                        class="dropdown-relation"
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
            if (!this.fromNode) return;
            if (this.selectedNode == null) return;
            const nodes = this.toNodes as Array<ApiNode>;

            let from = this.fromNode.label;
            let to = nodes.find((node) => node.name == this.selectedNode)?.label;
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
                );

                this.$emit("input-confirm", {
                    selectedRelationType: this.selectedRelationType,
                    from: this.switched ? selection : this.fromNode,
                    to: this.switched ? this.fromNode : selection,
                });
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

.mid-section {
    position: relative;
    padding: 32px;
    border-top: 8px solid @primary_color;
    display: flex;
    align-items: center;
    width: 524px;
}

.selection {
    display: flex;
    flex-direction: column;
    width: calc(100% - 128px);

    .direction {
        margin-top: 12px;
        display: flex;
        align-items: center;

        .flex-wrapper {
            .fromTo {
                display: flex;
                align-items: center;

                .node {
                    border-bottom: 1px solid @grey;
                    padding: 8px;
                    margin-right: 12px;
                    width: 256px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
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

        .dropdown-relation {
            padding-top: 8px;
            width: 256px;
        }
    }
}

.text {
    width: 40px;
    font-style: italic;
    font-size: @normal_text;
}
</style>
