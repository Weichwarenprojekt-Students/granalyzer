<template>
    <div class="conflict-card">
        <!-- The dialog for forcing an update -->
        <ConfirmDialog
            @confirm="force"
            @cancel="forceUpdateDialog = false"
            :show="forceUpdateDialog"
            :title="$t('schemes.conflictView.updateDialog.title')"
            :description="$t('schemes.conflictView.updateDialog.description')"
        ></ConfirmDialog>

        <!-- The actual card content -->
        <svg class="conflict-icon">
            <use :xlink:href="`${require('@/assets/img/icons.svg')}#warning`"></use>
        </svg>
        <div class="conflict-content">
            <div class="conflict-actions">
                <span class="conflict-title">{{ conflict.title }}</span>
                <a @click="revert" class="conflict-remove" v-tooltip.top="$t('schemes.conflictView.revert')">
                    <svg class="conflict-remove">
                        <use :xlink:href="`${require('@/assets/img/icons.svg')}#revert`"></use>
                    </svg>
                </a>
                <a
                    @click="forceUpdateDialog = true"
                    class="conflict-remove"
                    v-tooltip.top="$t('schemes.conflictView.check')"
                >
                    <svg class="conflict-remove">
                        <use :xlink:href="`${require('@/assets/img/icons.svg')}#check`"></use>
                    </svg>
                </a>
            </div>
            <span class="conflict-description">{{ conflict.description }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Conflict } from "@/modules/schemes/modules/conflict-view/models/Conflict";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";

export default defineComponent({
    name: "ConflictCard",
    components: { ConfirmDialog },
    props: {
        conflict: {
            type: Object,
            default: new Conflict(),
        },
    },
    data() {
        return {
            // True if the dialog shall be shown
            forceUpdateDialog: false,
        };
    },
    methods: {
        /**
         * Force the update
         */
        force(): void {
            this.conflict.force();
            this.$store.commit("schemes/removeConflict", this.conflict);
            this.forceUpdateDialog = false;
        },
        /**
         * Revert the changes
         */
        revert(): void {
            this.conflict.revert();
            this.$store.commit("schemes/removeConflict", this.conflict);
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.conflict-icon {
    width: 64px;
    height: 64px;
    fill: @warn;
    margin-right: 24px;
    flex: 0 0 auto;
}

.conflict-card {
    padding: 24px 16px;
    border-bottom: 1px solid @grey;
    display: flex;
    align-items: center;
    flex-direction: row;
}

.conflict-content {
    display: flex;
    flex-direction: column;
}

.conflict-title {
    font-weight: bold;
}

.conflict-actions {
    fill: @dark;
    display: flex;
    flex-direction: row;
    gap: 12px;
    align-items: center;
}

.conflict-button {
    font-size: @description;
    padding: 2px 4px;
    width: auto;
}

.conflict-remove {
    height: 16px;
    width: 16px;
    cursor: pointer;
}

.conflict-description {
    margin-top: 8px;
    font-size: @description;
}
</style>
