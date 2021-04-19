<template>
    <div :class="['attribute-view', { 'attribute-view-expanded': !collapsed }]">
        <!-- The header -->
        <div class="attribute-header">
            <svg class="attribute-collapse-icon" @click="collapsed = !collapsed">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#arrow`"></use>
            </svg>
            <label :key="'name_label'" class="attribute-name">
                <input :key="'name_input'" type="text" v-model="modifiedAttribute.name" />
            </label>
            <span class="attribute-type">{{ $t(`schemes.attribute.datatype.${modifiedAttribute.datatype}`) }}</span>
            <div class="attribute-spacer" />
            <svg class="attribute-delete-icon" @click="$emit('delete')">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#delete`"></use>
            </svg>
        </div>

        <!-- The expandable content -->
        <div class="attribute-expanded">
            <div class="attribute-modification-row">
                <span>{{ $t("schemes.attribute.type") }}</span>
                <Dropdown
                    :force-close="collapsed"
                    :value="$t(`schemes.attribute.datatype.${modifiedAttribute.datatype}`)"
                >
                    <div :key="type" v-for="type in types" @click="modifiedAttribute.datatype = type">
                        {{ $t(`schemes.attribute.datatype.${type}`) }}
                    </div>
                </Dropdown>
            </div>
            <div class="attribute-modification-row">
                <span>{{ $t("schemes.attribute.mandatory") }}</span>
                <Checkbox class="attribute-checkbox" v-model="modifiedAttribute.mandatory" :binary="true" />
            </div>
            <div class="attribute-modification-row">
                <span>{{ $t("schemes.attribute.default") }}</span>
                <DynamicInput v-model="modifiedAttribute.defaultValue" :type="modifiedAttribute.datatype" />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";
import { ApiDatatype } from "@/models/data-scheme/ApiDatatype";
import Dropdown from "@/components/Dropdown.vue";
import DynamicInput from "@/components/DynamicInput.vue";

export default defineComponent({
    name: "AttributeView",
    components: {
        DynamicInput,
        Dropdown,
    },
    props: {
        // The name of the attribute
        name: String,
        // The datatype of the attribute
        datatype: String,
        // The default value for the attribute
        defaultValue: String,
        // True if the attribute is mandatory
        mandatory: Boolean,
    },
    data() {
        return {
            // True if the view is collapsed
            collapsed: true,
            // The modified attribute object
            modifiedAttribute: new ApiAttribute(),
            // The different data types
            types: ApiDatatype,
        };
    },
    created() {
        this.modifiedAttribute = new ApiAttribute(this.name, this.datatype, this.mandatory, this.defaultValue);
    },
    watch: {
        /**
         * Check if one of the attributes was modified
         */
        modifiedAttribute: {
            handler() {
                this.$emit("update:name", this.modifiedAttribute.name);
                this.$emit("update:datatype", this.modifiedAttribute.datatype);
                this.$emit("update:defaultValue", this.modifiedAttribute.defaultValue);
                this.$emit("update:mandatory", this.modifiedAttribute.mandatory);
            },
            deep: true,
        },
    },
});
</script>

<style lang="less" scoped>
@import "../styles/schemes";

@attribute_edit_height: 48px;

.attribute-view {
    height: @line_height;
    margin-bottom: 16px;
    overflow: hidden;
    transition: height 400ms;
    margin-right: 18px;
}

.attribute-view-expanded {
    height: @line_height + 3 * @attribute_edit_height;

    .attribute-collapse-icon {
        transform: rotate(90deg);
    }

    .attribute-expanded {
        height: 3 * @attribute_edit_height;
    }
}

.attribute-header {
    padding-left: 4px;
    padding-right: 16px;
    align-items: center;
    height: @line_height;
    display: flex;
    border-bottom: 1px solid @grey;

    .attribute-spacer {
        flex: 1 1 auto;
    }
}

.attribute-collapse-icon {
    line-height: inherit;
    cursor: pointer;
    width: 36px;
    height: 36px;
    padding: 12px;
    fill: @dark;
    transition: transform 400ms;
}

.attribute-name {
    width: 100px;
    height: @line_height;
    line-height: @line_height;
    margin-right: 16px;

    input {
        width: 100px;
        padding: 8px 12px;
        height: 30px;
        background: @light_grey;
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

.attribute-checkbox {
    margin-right: 124px;
}

.attribute-expanded {
    margin-left: 140px;
    padding: 0 16px;
    height: 0;
    border-bottom: 1px solid @grey;
    transition: height 400ms;
}

.attribute-modification-row {
    align-items: center;
    height: @attribute_edit_height;
    display: flex;
    justify-content: space-between;
}
</style>
