<template>
    <div class="content">
        <div class="underlined-title">
            {{ $t("schemes.label-editor.title") }}
        </div>
        <ScrollPanel class="scroll-panel">
            <!-- The main attributes -->
            <label class="main-attribute">
                <span>{{ $t("schemes.label-editor.name") }}</span>
                <span> {{ modifiedLabel.name }}</span>
            </label>
            <label class="main-attribute">
                <span>{{ $t("schemes.label-editor.color") }}</span>
                <ColorMultiInput v-model="modifiedLabel.color" />
            </label>

            <!-- The optional parameters -->
            <div class="attributes-action-bar">
                <h4>{{ $t("schemes.label-editor.attributes") }}</h4>
                <svg class="add-attribute" @click="addAttribute">
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#plus-bold`"></use>
                </svg>
            </div>

            <AttributeView
                v-for="(attribute, index) in modifiedLabel.attributes"
                :key="`${label.name}-${attribute.name}`"
                v-model:name="attribute.name"
                v-model:mandatory="attribute.mandatory"
                v-model:defaultValue="attribute.defaultValue"
                v-model:datatype="attribute.datatype"
                @delete="deleteAttribute(index)"
            />

            <!-- The save button --->
            <div class="bottom-bar">
                <button v-if="isModified" class="btn btn-normal">{{ $t("schemes.label-editor.save") }}</button>
            </div>

            <div class="space"></div>
        </ScrollPanel>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ColorMultiInput from "@/components/ColorMultiInput.vue";
import ApiLabel from "@/models/data-scheme/ApiLabel";
import { deepCopy } from "@/utility";
import AttributeView from "@/modules/schemes/components/AttributeView.vue";
import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";

export default defineComponent({
    name: "LabelEditor",
    components: { AttributeView, ColorMultiInput },
    props: {
        // The label that will be modified
        label: {
            type: Object,
            default: new ApiLabel(),
        },
    },
    data() {
        return {
            modifiedLabel: new ApiLabel(),
        };
    },
    created() {
        this.modifiedLabel = deepCopy(this.label) as ApiLabel;
    },
    watch: {
        /**
         * Check if the input changed
         */
        label() {
            this.modifiedLabel = deepCopy(this.label) as ApiLabel;
        },
    },
    computed: {
        /**
         * @return True if the label was modified
         */
        isModified(): boolean {
            if (!this.modifiedLabel) return false;
            if (this.label.attributes.length != this.modifiedLabel.attributes.length) return true;
            for (let i = 0; i < this.modifiedLabel.attributes.length; i++)
                if (!ApiAttribute.isEqual(this.modifiedLabel.attributes[i], this.label.attributes[i])) return true;
            return (
                this.label.color.toUpperCase() != this.modifiedLabel.color || this.label.name != this.modifiedLabel.name
            );
        },
    },
    methods: {
        /**
         * Delete an attribute by index
         *
         * @param index The index of the attribute
         */
        deleteAttribute(index: number): void {
            this.modifiedLabel.attributes.splice(index, 1);
        },
        /**
         * Add a new attribute
         */
        addAttribute(): void {
            this.modifiedLabel.attributes.push(new ApiAttribute(this.$t("schemes.attribute.new")));
        },
    },
});
</script>

<style lang="less" scoped>
@import "../../styles/schemes.less";
</style>
