<template>
    <div class="modal-background" @click="close"></div>
    <div class="modal">
        <div class="modal-header">
            <h2>Edit Enum values</h2>
            <svg class="close-icon" @click="close">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#delete`"></use>
            </svg>
        </div>
        <div class="modal-body">
            <ul class="enum-prop-list">
                <li class="enum-prop-list-element" :key="el" v-for="el in modifiedConfig">
                    {{ el }}
                    <svg class="delete-enum-prop-icon" @click="removeEnumProp(el)">
                        <use :xlink:href="`${require('@/assets/img/icons.svg')}#delete`"></use>
                    </svg>
                </li>
            </ul>
            <div class="add-enum">
                <input id="add-enum-txt" class="input text-input" v-on:keyup.enter="addEnumProp" />
                <button class="btn btn-normal" @click="addEnumProp">Add</button>
            </div>
        </div>
        <div class="modal-footer">
            <div class="footer-buttons">
                <button class="btn btn-secondary" @click="close">Close</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { EnumConfigElement } from "@/models/data-scheme/EnumConfigElement";

export default defineComponent({
    name: "EditEnumModal",
    props: ["config"],
    emits: ["update:config", "close"],
    data() {
        return {
            modifiedConfig: [] as Array<EnumConfigElement>,
            addEnumValue: "",
        };
    },
    created() {
        this.modifiedConfig = this.config ?? [];
    },
    mounted() {
        window.addEventListener("keyup", this.onKeyUp);
    },
    unmounted() {
        window.removeEventListener("keyup", this.onKeyUp);
    },
    methods: {
        onKeyUp(e: KeyboardEvent): void {
            if (e.key == "Escape") this.close();
        },

        close() {
            this.$emit("update:config", this.modifiedConfig);
            this.$emit("close");
        },

        addEnumProp() {
            const inputElement = document.querySelector("#add-enum-txt") as HTMLInputElement;
            const value = inputElement.value.trim();
            if (value && this.modifiedConfig.filter((el) => el === value).length === 0) {
                this.modifiedConfig.push(value);
                inputElement.value = "";
            }
        },

        removeEnumProp(el: string) {
            this.modifiedConfig.splice(this.config.indexOf(el), 1);
        },
    },
});
</script>

<style lang="less">
@import "~@/styles/global.less";

.modal-background {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(177, 177, 177, 0.5);
}

.modal {
    position: fixed;
    top: 20vh;
    max-height: 40vh;
    min-height: 25vh;
    height: auto;
    width: 500px;
    background: white;
}

.modal-header,
.modal-body,
.modal-footer {
    padding: 16px;
    width: 100%;
}

.modal-header {
    position: relative;
    border-bottom: 1px solid @secondary_color;
}

.modal-body {
    height: auto;
    min-height: 100px;
    margin-bottom: 48px;
}

.modal-footer {
    position: absolute;
    bottom: 0;
    display: flex;
    justify-content: flex-end;
}

.close-icon {
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    height: 48px;
    width: 48px;
    padding: 16px;
}

.add-enum {
    display: flex;
    justify-items: end;
    justify-content: end;
    align-content: end;
    gap: 8px;
    width: 100%;
}

.delete-enum-prop-icon {
    height: 16px;
    width: 16px;
    cursor: pointer;
    margin-left: 4px;
}

.enum-prop-list {
    padding: 0;
    display: block;
    list-style: none;
    width: 100%;
    text-align: right;
}

.enum-prop-list-element {
    font-size: 18px;
    line-height: 24px;
    padding: 4px 8px;

    svg {
        margin-left: 8px;
    }
}
</style>
