<template>
    <!-- Expand the base dialog -->
    <BaseDialog :show="show" @cancel="$emit('cancel')" @confirm="$emit('confirm', name)">
        <div class="mid-section">
            <svg>
                <use :xlink:href="imageSrc"></use>
            </svg>
            <div class="input-wrap">
                <label for="name-input">{{ title }}</label>
                <input
                    tabindex="0"
                    class="input-large"
                    v-model.trim="name"
                    type="text"
                    id="name-input"
                    placeholder="Name"
                    autocomplete="off"
                />
            </div>
        </div>
    </BaseDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseDialog from "@/components/dialog/BaseDialog.vue";

export default defineComponent({
    name: "InputDialog",
    emits: ["cancel", "confirm"],
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
        // Default value
        default: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            // The value of the input field
            name: "",
        };
    },
    mounted() {
        this.name = this.default;
    },
    watch: {
        default() {
            this.name = this.default;
        },
    },
    updated() {
        // Auto focus the input field
        requestAnimationFrame(() => document.getElementById("name-input")?.focus());
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

        input {
            border-bottom: 1px solid @grey;
            width: auto;
        }
    }
}
</style>
