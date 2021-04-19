<template>
    <InputNumber
        v-if="type === datatype.NUMBER"
        v-model="numberValue"
        showButtons
        class="input"
        :placeholder="$t('global.input.placeholder')"
    />
    <ColorMultiInput v-else-if="type === datatype.COLOR" v-model="value" class="input" />
    <label v-else>
        <input v-model="value" class="input text-input" :placeholder="$t('global.input.placeholder')" />
    </label>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ApiDatatype } from "@/models/data-scheme/ApiDatatype";
import ColorMultiInput from "@/components/ColorMultiInput.vue";
import { isColor } from "@/utility";

export default defineComponent({
    name: "DynamicInput",
    components: { ColorMultiInput },
    props: {
        // The v-model
        modelValue: {
            type: String,
            default: "",
        },
        // The type that the input should show
        type: {
            type: String,
            default: ApiDatatype.STRING,
        },
    },
    data() {
        return {
            // The number value required for the number input
            numberValue: 0,
            // The value for the v model
            value: "",
            // The data type enum
            datatype: ApiDatatype,
        };
    },
    created() {
        this.value = this.modelValue;
    },
    watch: {
        /**
         * Watch for type changes and try to keep the last value
         */
        type() {
            const number = parseFloat(this.value);
            switch (this.type) {
                case ApiDatatype.NUMBER:
                    if (!isNaN(number)) this.numberValue = number;
                    else this.numberValue = 0;
                    this.value = this.numberValue.toString();
                    break;
                case ApiDatatype.COLOR:
                    if (!isColor(this.value)) this.value = "#333333";
                    break;
                default:
                    this.value = this.value.toString();
            }
        },
        /**
         * Watch for changes from the number input
         */
        numberValue() {
            this.value = this.numberValue.toString();
        },
        /**
         * Check for changes of the v model
         */
        value() {
            this.$emit("update:modelValue", this.value);
        },
    },
});
</script>

<style lang="less">
@import "~@/styles/global.less";

.input {
    width: @input_width;
    border: 0;
}

.text-input {
    padding: 6px 12px;
    background: @light_grey;
}
</style>
