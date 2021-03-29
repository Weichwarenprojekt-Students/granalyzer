<template>
    <!-- Expand the base dialog -->
    <BaseDialog :show="show" @confirm="$emit('input-confirm', name)">
        <div class="mid-section">
            <svg>
                <use :xlink:href="imageSrc"></use>
            </svg>
            <div class="input-wrap">
                <label for="name-input">{{ title }}</label>
                <input tabindex="0" class="input-large" v-model="name" type="text" id="name-input" placeholder="Name" />
            </div>
        </div>
    </BaseDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseDialog from "@/components/BaseDialog.vue";

export default defineComponent({
    name: "InputDialog",
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
    },
    data() {
        return {
            // The value of the input field
            name: "",
        };
    },
    updated() {
        // Auto focus the input field
        this.$nextTick().then(() => document.getElementById("name-input")?.focus());
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
        height: 96px;
        width: 96px;
        margin-right: 32px;
    }

    div {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: calc(100% - 128px);

        label {
            font-size: @h1;
            margin-bottom: 8px;
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
}
</style>
