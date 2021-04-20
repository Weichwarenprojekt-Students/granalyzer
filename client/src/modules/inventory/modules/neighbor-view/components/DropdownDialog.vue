<template>
    <!-- Expand the base dialog -->
    <BaseDialog :show="show" @confirm="$emit('input-confirm', { selectedRelationType, switched })">
        <div class="mid-section">
            <svg class="icon-add">
                <use :xlink:href="imageSrc"></use>
            </svg>
            <div class="selection">
                <!-- Title -->
                <h1>{{ $t("inventory.dialog.title") }}</h1>

                <!-- Relation-direction selection -->
                <div class="direction">
                    <div class="flex-wrapper">
                        <div class="fromTo">
                            <div class="text">{{ $t("inventory.dialog.from") }}</div>
                            <div class="node">{{ switched ? originNode.name : draggedNode.name }}</div>
                        </div>
                        <div class="fromTo">
                            <div class="text">{{ $t("inventory.dialog.to") }}</div>
                            <div class="node">{{ switched ? draggedNode.name : originNode.name }}</div>
                        </div>
                    </div>
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
                        :placeholder="$t('inventory.dialog.dropdown.placeholder')"
                        :emptyMessage="$t('inventory.dialog.dropdown.empty')"
                    />
                </div>
            </div>
        </div>
    </BaseDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseDialog from "@/components/dialog/BaseDialog.vue";

export default defineComponent({
    name: "DropdownDialog",
    components: {
        BaseDialog,
    },
    props: {
        // True if the dialog should be shown
        show: Boolean,
        // The image source
        imageSrc: String,
        // Node that is selected in the list
        originNode: Object,
        // Node that was dragged into the graph
        draggedNode: Object,
    },
    data() {
        return {
            // Relation-dropdown selection
            selectedRelationType: null,
            // Possible relation types
            possibleRelationTypes: null,
            // True, if direction of relation was switched
            switched: false,
        };
    },
    watch: {
        /**
         * Check valid relation types when dialog is shown
         */
        show(visible) {
            if (!visible) return;
            this.checkPossibleRelationTypes();
        },
    },
    methods: {
        /**
         * Switch the direction of the relation
         */
        switchDirection() {
            this.switched = !this.switched;
            this.checkPossibleRelationTypes();
        },
        /**
         * Check for valid relation types
         */
        async checkPossibleRelationTypes(): Promise<void> {
            if (!(this.draggedNode && this.originNode)) return;

            let from = this.draggedNode.label;
            let to = this.originNode.label;
            if (this.switched) [from, to] = [to, from];

            this.possibleRelationTypes = await this.$store.dispatch("inventory/getPossibleRelationTypes", {
                fromLabel: from,
                toLabel: to,
            });
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

    .icon-add {
        fill: @dark;
        height: 96px;
        width: 96px;
        margin-right: 32px;
    }
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
                    padding: 12px 8px 8px 8px;
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
