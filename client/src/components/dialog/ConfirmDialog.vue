<template>
    <!-- Expand the base dialog -->
    <BaseDialog :show="show">
        <div class="mid-section">
            <svg>
                <use xlink:href="@/assets/img/icons.svg#warning"></use>
            </svg>
            <div>
                <h1>{{ title }}</h1>
                <h3>{{ description }}</h3>
            </div>
        </div>
    </BaseDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseDialog from "@/components/dialog/BaseDialog.vue";

export default defineComponent({
    name: "ConfirmDialog",
    components: {
        BaseDialog,
    },
    props: {
        // True if the dialog should be shown
        show: Boolean,
        // The title of the confirm dialog
        title: String,
        // The description
        description: String,
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
        width: 96px;
        height: 96px;
        margin-right: 32px;
    }

    div {
        width: calc(100% - 128px);

        h1 {
            margin-bottom: 12px;
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
        }
    }
}
</style>
