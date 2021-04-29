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
            // The color value
            color: "#FFFFFF",
            // True if the input color is invalid
            error: false,
            // True if the new color value should be pushed
            publish: true,
        };
    },
    mounted() {
        this.transformInput();
    },
    watch: {
        /**
         * Watch for color changes from the outside
         */
        modelValue() {
            this.transformInput();
        },
        /**
         * Watch for input changes
         */
        color() {
            // Correct the color value
            if (!this.color.startsWith("#")) this.color = `#${this.color}`;
            this.color = this.color.toUpperCase();

            // Emit the new value (for v-model)
            this.error = !isHexColor(this.color) || this.color.length < 7;
            if (!this.error && this.publish) this.$emit("update:modelValue", this.color);
            this.publish = true;
        },
    },
    methods: {
        /**
         * Transform incoming shorthand hex colors into normal hex strings
         * and cut the alpha channel
         */
        transformInput(): void {
            let validColor = "#";
            if (this.modelValue.length < 7)
                for (let i = 1; i < this.modelValue.length; i++)
                    validColor += this.modelValue.charAt(i) + this.modelValue.charAt(i);
            else validColor = this.modelValue;
            this.color = validColor.substr(0, 7);
            this.publish = false;
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
