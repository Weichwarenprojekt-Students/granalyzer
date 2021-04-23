<template>
    <div class="color-input">
        <ColorPicker v-model="color" defaultColor="#FFFFFF" format="hex" :disabled="disabled" />
        <label class="color-label">
            <input :class="{ 'color-error': error }" v-model="color" maxlength="7" type="text" :disabled="disabled" />
        </label>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { isHexColor } from "class-validator";

export default defineComponent({
    name: "ColorMultiInput",
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
            color: "#FFFFFF",
            error: false,
        };
    },
    mounted() {
        this.color = this.modelValue;
    },
    watch: {
        modelValue() {
            this.color = this.modelValue;
        },
        color() {
            // Correct the color value
            if (!this.color.startsWith("#")) this.color = `#${this.color}`;
            this.color = this.color.toUpperCase();

            // Emit the new value (for v-model)
            this.error = !isHexColor(this.color);
            if (!this.error) this.$emit("update:modelValue", this.color);
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global";

.color-input {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100%;
    overflow: hidden;
    gap: 12px;
}

.color-label {
    flex: 1 1 auto;

    input {
        border: 0;
        background: @light_grey;
        padding: 8px 12px;
        height: 30px;
        max-width: 100px;
    }
}

.color-error {
    color: @warn;
}
</style>
