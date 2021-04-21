<template>
    <!-- Expand the base dialog -->
    <BaseDialog class="base-dialog" :show="show" :bind-key-events="false" @confirm="confirmConfig" @cancel="cancel">
        <div class="modal-header">
            <h1>{{ $t("schemes.attribute.editEnumConfig.title") }}</h1>
        </div>
        <div class="modal-body">
            <div class="add-enum">
                <button class="btn btn-normal" @click="addEnumProp()">
                    {{ $t("schemes.attribute.editEnumConfig.add") }}
                </button>
                <input
                    id="add-enum-txt"
                    :placeholder="$t('schemes.attribute.editEnumConfig.newElementPlaceholder')"
                    class="input text-input"
                    v-on:keyup.enter="addEnumProp()"
                />
            </div>
            <ul class="enum-prop-list">
                <li class="enum-prop-list-element" :key="el" v-for="el in modifiedConfig">
                    {{ el }}
                    <svg class="delete-enum-prop-icon" @click="removeEnumProp(el)">
                        <use :xlink:href="`${require('@/assets/img/icons.svg')}#delete`"></use>
                    </svg>
                </li>
            </ul>
        </div>
    </BaseDialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { EnumConfigElement } from "@/models/data-scheme/EnumConfigElement";
import BaseDialog from "@/components/dialog/BaseDialog.vue";
import { deepCopy } from "@/utility";

export default defineComponent({
    name: "EditEnumModal",
    components: { BaseDialog },
    props: ["config", "show"],
    data() {
        return {
            modifiedConfig: [] as Array<EnumConfigElement>,
            addEnumValue: "",
        };
    },
    created() {
        this.modifiedConfig = deepCopy(this.config) ?? [];
    },
    methods: {
        /**
         * Abort and return the old list
         */
        cancel(): void {
            this.modifiedConfig = deepCopy(this.config);
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
            const inputElement = document.querySelector("#add-enum-txt") as HTMLInputElement;
            const value = inputElement.value.trim();
            if (value && this.modifiedConfig.filter((el) => el === value).length === 0) {
                this.modifiedConfig.push(value);
                inputElement.value = "";
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
    padding: 16px;
    width: 500px;
}

.modal-header {
    position: relative;
    padding-bottom: 0;
    padding-top: 20px;
    margin-bottom: 8px;
    border-top: 8px solid @primary_color;
}

.modal-body {
    height: auto;
    max-height: 350px;
    min-height: 100px;
    margin-bottom: 16px;
}

.add-enum {
    display: flex;
    flex-direction: row-reverse;
    gap: 8px;
    width: 100%;
    padding-bottom: 8px;
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

.enum-prop-list {
    padding: 0;
    display: block;
    list-style: none;
    width: 100%;
    text-align: right;
    max-height: 300px;
    height: auto;
    overflow: auto;
}

.enum-prop-list-element {
    font-size: 18px;
    line-height: 24px;
    padding: 4px 8px;
    text-align: left;

    svg {
        margin-left: 8px;
    }
}
</style>
