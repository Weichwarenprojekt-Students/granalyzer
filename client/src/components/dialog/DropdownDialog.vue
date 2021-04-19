<template>
    <!-- Expand the base dialog -->
    <BaseDialog :show="show" @confirm="$emit('input-confirm', selectedDropdownEntry)">
        <div class="mid-section">
            <svg>
                <use :xlink:href="imageSrc"></use>
            </svg>
            <div class="selection">
                <h1>{{ title }}</h1>
                <Dropdown
                    class="dropdown"
                    v-model="selectedDropdownEntry"
                    :options="relationTypes"
                    :placeholder="$t('inventory.dialog.placeholder')"
                    :emptyMessage="$t('inventory.dialog.empty')"
                />
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
        // The title of the dialog
        title: String,
        // The image source
        imageSrc: String,
        // Possible relation types
        relationTypes: Array,
    },
    data() {
        return {
            // Dropdown selection
            selectedDropdownEntry: null,
        };
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
    width: 500px;

    svg {
        fill: @dark;
        height: 96px;
        width: 96px;
        margin-right: 32px;
    }

    .selection {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: calc(100% - 128px);

        .dropdown {
            width: 100%;
            margin-top: 8px;
        }
    }
}
</style>
