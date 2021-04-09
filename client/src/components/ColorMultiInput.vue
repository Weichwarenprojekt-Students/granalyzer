<template>
    <div class="color-input">
        <ColorPicker v-model="color" defaultColor="#FFFFFF" format="hex" />
        <label>
            <input v-model="color" maxlength="7" type="text" />
        </label>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { isColor } from "@/utility";

export default defineComponent({
    name: "ColorMultiInput",
    props: {
        modelValue: {
            type: String,
            default: "#FFFFFF",
        },
    },
    data() {
        return {
            color: "#FFFFFF",
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
            if (isColor(this.color)) this.$emit("update:modelValue", this.color);
        },
    },
});
</script>

<style lang="less" scoped>
.color-input {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 100%;
    gap: 16px;
}

input {
    border: 0;
}
</style>
