<template>
    <div class="number-input">
        <input inputmode="numeric" v-model="value" :placeholder="placeholder" :disabled="disabled" @keydown="keyDown" />
        <div>
            <svg @click="increaseValue" :class="{ 'disabled-button': disabled }">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#triangle`"></use>
            </svg>
            <svg @click="decreaseValue" style="transform: rotate(180deg)" :class="{ 'disabled-button': disabled }">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#triangle`"></use>
            </svg>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "NumberInput",
    props: {
        // The v-model
        modelValue: {
            type: [Number, String],
            default: 0,
        },
        // True if the input is disabled
        disabled: {
            type: Boolean,
            default: false,
        },
        // The placeholder of the input field
        placeholder: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            // The value for the v model
            value: "",
        };
    },
    created() {
        this.value = this.modelValue.toString();
    },
    watch: {
        /**
         * Check if the value was modified from the outside
         */
        modelValue() {
            if (parseFloat(this.value) !== this.modelValue) this.value = this.modelValue.toString();
        },
        /**
         * Check for changes of the v model
         */
        value(newVal, oldVal) {
            // Check whether the string already contains a comma or a point
            if ((newVal.match(/([.,])/g) || []).length > 1) {
                this.value = oldVal;
                return;
            }

            // Add a 0 if the string starts with ,
            newVal = newVal.replace(",", ".");
            if (newVal.startsWith(".")) newVal = "0" + newVal;

            // Only allow valid patterns
            const filtered = newVal.match("-?[0-9]*([.,][0-9]*)?");
            this.value = filtered ? filtered[0] : "";

            // Publish the new value
            const number = parseFloat(this.value);
            this.$emit("update:modelValue", isNaN(number) ? undefined : number);
        },
    },
    methods: {
        /**
         * Handle keyboard shortcuts
         */
        keyDown(e: KeyboardEvent): void {
            if (e.key === "ArrowUp") {
                this.increaseValue();
                e.preventDefault();
            } else if (e.key === "ArrowDown") {
                this.decreaseValue();
                e.preventDefault();
            }
        },
        /**
         * Increase the value
         */
        increaseValue(): void {
            let number = parseFloat(this.value);
            number = isNaN(number) ? 0 : number + 1;
            this.value = number.toString();
            this.$emit("change");
        },
        /**
         * Decrease the value
         */
        decreaseValue(): void {
            let number = parseFloat(this.value);
            number = isNaN(number) ? 0 : number - 1;
            this.value = number.toString();
            this.$emit("change");
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.number-input {
    background: @light_grey;
    padding: 6px 12px;
    width: @input_width;
    display: flex;
    gap: 8px;
    flex-direction: row;
    overflow: hidden;

    input {
        padding: 0;
        background: transparent;
        flex: 1 1 auto;
        width: 0;
    }

    div {
        height: auto;
        flex: 0 0 auto;
        display: flex;
        flex-direction: column;

        svg {
            background: @dark;
            height: 10px;
            width: 16px;
            padding: 2px;
            cursor: pointer;
            fill: @light_grey;
        }
    }
}

.disabled-button {
    pointer-events: none;
    background: @grey !important;
}
</style>
