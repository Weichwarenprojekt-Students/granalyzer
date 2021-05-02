<template>
    <div :class="['attribute-view', { 'attribute-view-expanded': !collapsed }]">
        <EditEnumModal
            @confirm="confirmEnumEdit"
            @cancel="isEditEnumModalVisible = false"
            v-model:config="modifiedAttribute.config"
            :show="isEditEnumModalVisible"
        ></EditEnumModal>

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
                <div class="attribute-type-select">
                    <svg v-show="isEnum" class="enum-edit-icon" @click="isEditEnumModalVisible = true">
                        <use :xlink:href="`${require('@/assets/img/icons.svg')}#editor`"></use>
                    </svg>
                    <Dropdown
                        :options="types"
                        optionLabel="name"
                        optionValue="value"
                        v-model="modifiedAttribute.datatype"
                        :placeholder="$t('global.dropdown.choose')"
                        :emptyMessage="$t('global.dropdown.empty')"
                    />
                </div>
            </div>
            <div class="attribute-modification-row">
                <span>{{ $t("schemes.attribute.mandatory") }}</span>
                <Checkbox class="attribute-checkbox" v-model="modifiedAttribute.mandatory" :binary="true" />
            </div>
            <div class="attribute-modification-row">
                <span>{{ $t("schemes.attribute.default") }}</span>
                <DynamicInput
                    class="attribute-default-input"
                    v-model="modifiedAttribute.defaultValue"
                    :config="modifiedAttribute.config"
                    :type="modifiedAttribute.datatype"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";
import { ApiDatatype } from "@/models/data-scheme/ApiDatatype";
import DynamicInput from "@/components/DynamicInput.vue";
import EditEnumModal from "./EditEnumModal.vue";
import { EnumConfigElement } from "@/modules/schemes/models/EnumConfigElement";

export default defineComponent({
    name: "AttributeView",
    components: {
        DynamicInput,
        EditEnumModal,
    },
    props: {
        // The name of the attribute
        name: String,
        // The datatype of the attribute
        datatype: String,
        // The default value for the attribute
        defaultValue: [String, Number],
        // True if the attribute is mandatory
        mandatory: Boolean,
        // Contains additional information like enum structure
        config: Array,
    },
    data() {
        return {
            // True if the view is collapsed
            collapsed: true,
            // The modified attribute object
            modifiedAttribute: new ApiAttribute(),
            // The different data types (prepared for the dropdown)
            types: Object.values(ApiDatatype).map((datatype) => {
                return {
                    name: this.$t(`schemes.attribute.datatype.${datatype}`),
                    value: datatype,
                };
            }),
            // Defines whether the modal is shown or not
            isEditEnumModalVisible: false,
        };
    },
    created() {
        this.modifiedAttribute = new ApiAttribute(
            this.name,
            this.datatype,
            this.mandatory,
            this.defaultValue,
            this.config as Array<EnumConfigElement>,
        );
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
                this.$emit("update:config", this.modifiedAttribute.config);
            },
            deep: true,
        },
    },
    computed: {
        /**
         * @return True if the datatype is an enum
         */
        isEnum(): boolean {
            return this.datatype === ApiDatatype.ENUM;
        },
    },
    methods: {
        /**
         * Ensure that the default value contains a correct enum value or nothing
         */
        confirmEnumEdit(): void {
            this.isEditEnumModalVisible = false;
            if (this.modifiedAttribute.config.length === 0) this.modifiedAttribute.defaultValue = "";
            else if (!this.modifiedAttribute.config.includes(this.modifiedAttribute.defaultValue as string))
                this.modifiedAttribute.defaultValue = this.modifiedAttribute.config[0];
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
    transition: height 400ms;
    margin-right: 18px;
    overflow: hidden;
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

.attribute-type-select {
    display: flex;
    align-items: center;
    gap: 8px;
}

.enum-edit-icon {
    width: 20px;
    height: 20px;
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

.attribute-default-input {
    width: @input_width;
}
</style>
