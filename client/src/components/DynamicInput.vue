<template>
    <InputNumber
        v-if="type === datatype.NUMBER"
        v-model="value"
        showButtons
        class="input"
        :placeholder="$t('global.input.placeholder')"
        :disabled="disabled"
    />
    <Dropdown v-else-if="type === datatype.ENUM" :options="config" v-model="value" :disabled="disabled" />
    <ColorPicker v-else-if="type === datatype.COLOR" v-model="value" :disabled="disabled" />
    <label v-else>
        <input
            v-model="value"
            class="input text-input"
            :placeholder="$t('global.input.placeholder')"
            :disabled="disabled"
        />
    </label>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ApiDatatype } from "@/models/data-scheme/ApiDatatype";
import { isHexColor, isNumber } from "class-validator";
import ColorPicker from "@/components/ColorPicker.vue";

export default defineComponent({
    name: "DynamicInput",
    components: { ColorPicker },
    props: {
        // The v-model
        modelValue: {
            type: [String, Number],
            default: "",
        },
        // The type that the input should show
        type: {
            type: String,
            default: ApiDatatype.STRING,
        },
        // The config for enums
        config: Array,
        // True if the input is disabled
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            // The value for the v model
            value: {},
            // The data type enum
            datatype: ApiDatatype,
        };
    },
    created() {
        this.value = this.modelValue;
        this.parseValue();
    },
    watch: {
        /**
         * Watch for type changes and try to keep the last value
         */
        type() {
            this.parseValue();
        },
        /**
         * Check if the value was modified from the outside
         */
        modelValue() {
            this.value = this.modelValue;
        },
        /**
         * Check for changes of the v model
         */
        value() {
            this.$emit("update:modelValue", this.value);
        },
    },
    methods: {
        /**
         * Parse the right value depending on the type
         */
        parseValue(): void {
            switch (this.type) {
                case ApiDatatype.NUMBER:
                    if (!isNumber(this.value)) this.value = 0;
                    break;
                case ApiDatatype.COLOR:
                    if (!isHexColor(this.value)) this.value = "#333333";
                    break;
                default:
                    this.value = this.value.toString();
            }
        },
    },
});
</script>

<style lang="less">
@import "~@/styles/global.less";

.text-input {
    padding: 6px 12px;
    background: @light_grey;
}
</style>
