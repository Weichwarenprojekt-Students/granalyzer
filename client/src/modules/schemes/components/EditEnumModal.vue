<template>
    <!-- Expand the base dialog -->
    <BaseDialog class="base-dialog" :show="show" :bind-key-events="false" @confirm="confirmConfig" @cancel="cancel">
        <div class="modal-header">
            <h1>{{ $t("schemes.attribute.editEnumConfig.title") }}</h1>
        </div>
        <div class="modal-body">
            <div class="add-enum">
                <button :disabled="!addEnumValue" class="btn btn-normal" @click="addEnumProp()">
                    {{ $t("schemes.attribute.editEnumConfig.add") }}
                </button>
                <input
                    :placeholder="$t('schemes.attribute.editEnumConfig.newElementPlaceholder')"
                    class="input text-input"
                    v-model="addEnumValue"
                    v-on:keyup.enter="addEnumProp()"
                />
            </div>
            <ScrollPanel class="list-wrapper">
                <ul class="enum-prop-list">
                    <li class="enum-prop-list-element" :key="el" v-for="el in modifiedConfig">
                        {{ el }}
                        <svg class="delete-enum-prop-icon" @click="removeEnumProp(el)">
                            <use :xlink:href="`${require('@/assets/img/icons.svg')}#delete`"></use>
                        </svg>
                    </li>
                </ul>
            </ScrollPanel>
        </div>
    </BaseDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BaseDialog from "@/components/dialog/BaseDialog.vue";
import { deepCopy, errorToast } from "@/utility";
import { EnumConfigElement } from "@/modules/schemes/models/EnumConfigElement";

export default defineComponent({
    name: "EditEnumModal",
    components: { BaseDialog },
    props: {
        config: Array,
        show: Boolean,
    },
    data() {
        return {
            // The enum config
            modifiedConfig: [] as Array<EnumConfigElement>,
            // The input value
            addEnumValue: "" as string,
        };
    },
    created() {
        this.modifiedConfig = deepCopy(this.config as Array<EnumConfigElement>) ?? [];
    },
    methods: {
        /**
         * Abort and return the old list
         */
        cancel(): void {
            this.modifiedConfig = deepCopy(this.config as Array<EnumConfigElement>);
            this.$emit("update:config", this.config);
            this.$emit("cancel");
        },
        /**
         * Confirms and return the edited list
         */
        confirmConfig(): void {
            this.$emit("update:config", this.modifiedConfig);
            this.$emit("confirm");
        },
        /**
         * Add a element to the list
         */
        addEnumProp() {
            if (!this.addEnumValue) return;
            this.addEnumValue = this.addEnumValue.trim();
            if (!this.modifiedConfig.includes(this.addEnumValue)) {
                this.modifiedConfig.push(this.addEnumValue);
                this.addEnumValue = "";
            } else {
                errorToast(
                    this.$t("schemes.attribute.editEnumConfig.duplicateElement.title"),
                    this.$t("schemes.attribute.editEnumConfig.duplicateElement.description"),
                );
            }
        },
        /**
         * Delete a element from the list
         */
        removeEnumProp(el: string) {
            this.modifiedConfig.splice(this.modifiedConfig.indexOf(el), 1);
        },
    },
});
</script>

<style lang="less">
@import "~@/styles/global.less";

.modal-header,
.modal-body {
    padding: 16px 32px;
    width: 450px;
}

.modal-header {
    position: relative;
    padding-bottom: 0;
    padding-top: 20px;
    border-top: 8px solid @primary_color;
}

.add-enum {
    display: flex;
    flex-direction: row-reverse;
    gap: 8px;
    width: 100%;
    margin-bottom: 16px;
}

.add-enum input {
    flex-grow: 1;
}

.delete-enum-prop-icon {
    height: 12px;
    width: 12px;
    cursor: pointer;
    margin-left: 4px;
}

.list-wrapper {
    height: 200px;
    overflow: hidden;
}

.enum-prop-list {
    padding: 0;
    display: block;
    list-style: none;
    width: 100%;
    text-align: right;
}

.enum-prop-list-element {
    line-height: 24px;
    padding: 4px 16px 4px 16px;
    border-bottom: 1px solid @grey;
    margin-bottom: 4px;
    margin-right: 18px;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;

    svg {
        fill: @dark;
        margin-left: 8px;
    }
}
</style>
