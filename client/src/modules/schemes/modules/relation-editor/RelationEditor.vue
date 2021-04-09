<template>
    <div class="content">
        <div class="underlined-title">
            {{ $t("schemes.relation-editor.title") }}
        </div>
        <ScrollPanel class="scroll-panel">
            <!-- The main attributes -->
            <label class="main-attribute">
                <span>{{ $t("schemes.relation-editor.name") }}</span>
                <span> {{ modifiedRelation.name }}</span>
            </label>

            <!-- The optional parameters -->
            <div class="attributes-action-bar">
                <h4>{{ $t("schemes.relation-editor.attributes") }}</h4>
                <svg class="add-attribute" @click="addAttribute">
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#plus-bold`"></use>
                </svg>
            </div>

            <AttributeView
                v-for="(attribute, index) in modifiedRelation.attributes"
                :key="`${relation.name}-${attribute.name}`"
                v-model:name="attribute.name"
                v-model:mandatory="attribute.mandatory"
                v-model:defaultValue="attribute.defaultValue"
                v-model:datatype="attribute.datatype"
                @delete="deleteAttribute(index)"
            />

            <!-- The save button --->
            <div class="bottom-bar">
                <button v-if="isModified" class="btn btn-secondary" @click="saveRelation">
                    {{ $t("schemes.relation-editor.save") }}
                </button>
            </div>

            <div class="space"></div>
        </ScrollPanel>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { deepCopy } from "@/utility";
import AttributeView from "@/modules/schemes/components/AttributeView.vue";
import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";
import ApiRelation from "@/models/data-scheme/ApiRelation";

export default defineComponent({
    name: "RelationEditor",
    components: { AttributeView },
    props: {
        // The relation that will be modified
        relation: {
            type: Object,
            default: new ApiRelation(),
        },
    },
    data() {
        return {
            modifiedRelation: new ApiRelation(),
        };
    },
    created() {
        this.modifiedRelation = deepCopy(this.relation) as ApiRelation;
    },
    watch: {
        /**
         * Check if the input changed
         */
        relation() {
            this.modifiedRelation = deepCopy(this.relation) as ApiRelation;
        },
    },
    computed: {
        /**
         * @return True if the label was modified
         */
        isModified(): boolean {
            if (this.relation.attributes.length != this.modifiedRelation.attributes.length) return true;
            for (let i = 0; i < this.modifiedRelation.attributes.length; i++)
                if (!ApiAttribute.isEqual(this.modifiedRelation.attributes[i], this.relation.attributes[i]))
                    return true;
            return this.relation.name != this.modifiedRelation.name;
        },
    },
    methods: {
        /**
         * Delete an attribute by index
         *
         * @param index The index of the attribute
         */
        deleteAttribute(index: number): void {
            this.modifiedRelation.attributes.splice(index, 1);
        },
        /**
         * Add a new attribute
         */
        addAttribute(): void {
            this.modifiedRelation.attributes.push(new ApiAttribute(this.$t("schemes.attribute.new")));
        },
        /**
         * Save the changed relation
         */
        saveRelation(): void {
            this.$store.dispatch("schemes/updateRelation", this.relation);
        },
    },
});
</script>

<style lang="less" scoped>
@import "../../styles/schemes.less";
</style>
