<template>
    <div class="attribute-view">
        <!-- The header -->
        <div class="attribute-header">
            <span class="attribute-type">from</span>
            <Dropdown
                :options="$store.state.schemes.labels"
                optionLabel="name"
                optionValue="name"
                v-model="fromModified"
                :placeholder="$t('global.dropdown.choose')"
                :emptyMessage="$t('global.dropdown.empty')"
            />
            <span class="attribute-type">to</span>
            <Dropdown
                :options="$store.state.schemes.labels"
                optionLabel="name"
                optionValue="name"
                v-model="toModified"
                :placeholder="$t('global.dropdown.choose')"
                :emptyMessage="$t('global.dropdown.empty')"
            />
            <div class="attribute-spacer" />
            <svg class="attribute-delete-icon" @click="$emit('delete')">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#delete`"></use>
            </svg>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "ConnectionView",
    props: {
        // The possible source label of a connection
        from: String,
        // The possible target label of a connection
        to: String,
    },
    data() {
        return {
            // The possible source label of a connection
            fromModified: "",
            // The possible target label of a connection
            toModified: "",
        };
    },
    mounted() {
        this.fromModified = this.from ?? "";
        this.toModified = this.to ?? "";
    },
    watch: {
        /**
         * Update the v-model if one of the from was modified
         */
        fromModified() {
            this.$emit("update:from", this.fromModified);
        },
        /**
         * Update the v-model if one of the to was modified
         */
        toModified() {
            this.$emit("update:to", this.toModified);
        },
    },
});
</script>

<style lang="less" scoped>
@import "../../../styles/schemes";

@attribute_edit_height: 48px;

.attribute-view {
    height: @line_height;
    margin-bottom: 16px;
    transition: height 400ms;
    margin-right: 18px;
}

.attribute-header {
    padding-left: 16px;
    padding-right: 16px;
    align-items: center;
    height: @line_height;
    display: flex;
    border-bottom: 1px solid @grey;
    gap: 12px;

    .attribute-spacer {
        flex: 1 1 auto;
    }
}

.attribute-name {
    width: 80px;
    height: @line_height;
    line-height: @line_height;
    margin-right: 12px;

    input {
        width: 80px;
        border: 0;
    }
}

.attribute-type {
    font-style: italic;
}

.attribute-delete-icon {
    width: 12px;
    height: 12px;
    fill: @dark;
    cursor: pointer;
}
</style>
