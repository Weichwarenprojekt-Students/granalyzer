<template>
    <label class="searchbar">
        <input v-model.trim="inputValue" type="text" :placeholder="$t('global.searchPlaceholder')" />
        <svg class="close" v-if="inputValue.length > 0" @click="inputValue = ''">
            <use xlink:href="@/assets/img/icons.svg#delete"></use>
        </svg>
        <svg v-if="showFilter" class="filter-icon" @click="$emit('show-filter')">
            <use :xlink:href="`${require('@/assets/img/icons.svg')}#filter`"></use>
        </svg>
    </label>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "Searchbar",
    props: {
        // Visibility of filter icon
        showFilter: {
            type: Boolean,
            default: true,
        },
        // The input value
        modelValue: {
            type: String,
            default: "",
        },
    },
    data() {
        return {
            // Searchbar input value
            inputValue: "",
        };
    },
    mounted() {
        this.inputValue = this.modelValue;
    },
    watch: {
        /**
         * Watch filter property for changes to trigger label filtering
         */
        inputValue() {
            this.$emit("update:modelValue", this.inputValue);
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.searchbar {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    margin: 8px 0;
    padding: 6px 16px;
    background: @light_grey;
    gap: 12px;

    input[type="text"] {
        width: 100%;
        background: transparent;
        border: none;
    }
}

.close {
    cursor: pointer;
    height: 14px;
    width: 14px;
    fill: @dark_grey;
}

.filter-icon {
    width: 20px;
    height: 20px;
    flex: 0 0 auto;
    fill: @dark;
    cursor: pointer;
}
</style>
