<template>
    <div class="color-multi-input" @click="$refs.colorInput.click">
        <input
            @change="$emit('change')"
            class="color-input"
            ref="colorInput"
            type="color"
            v-model="color"
            :disabled="disabled"
        />
        <span class="color-preview" ref="colorPreview"></span>
        <div class="color-label">{{ color }}</div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "ColorPicker",
    props: {
        // The v-model
        modelValue: {
            type: String,
            default: "#FFFFFF",
        },
        // True if the input is disabled
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            // The modified color value
            color: "#FFFFFF",
        };
    },
    mounted() {
        this.color = this.modelValue;
    },
    watch: {
        /**
         * Watch for color changes from the outside
         */
        modelValue() {
            this.color = this.modelValue;
        },
        /**
         * Watch for input changes
         */
        color() {
            (this.$refs.colorPreview as HTMLElement).style.background = this.color;
            this.color = this.color.toUpperCase();
            this.$emit("update:modelValue", this.color);
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global";

.color-multi-input {
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100%;
    overflow: hidden;
    gap: 12px;
    position: relative;
}

.color-input {
    position: absolute;
    left: 0;
    opacity: 0;
    width: 0;
}

.color-preview {
    width: 28px;
    height: 28px;
    border-radius: 14px;
    border: 1px solid @grey;
    background: red;
    display: inline-block;
}

.color-label {
    flex: 1 1 auto;
}
</style>
