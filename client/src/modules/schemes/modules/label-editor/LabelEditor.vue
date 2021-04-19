<template>
    <div class="content">
        <!-- The dialog for deleting a label -->
        <ConfirmDialog
            @confirm="deleteLabel"
            @cancel="deleteLabelDialog = false"
            :show="deleteLabelDialog"
            :title="$t('schemes.labelEditor.deleteDialog.title')"
            :description="$t('schemes.labelEditor.deleteDialog.description')"
        ></ConfirmDialog>

        <div class="underlined-title">
            {{ $t("schemes.labelEditor.title") }}
        </div>
        <ScrollPanel class="scroll-panel">
            <!-- The main attributes -->
            <label class="main-attribute">
                <span>{{ $t("schemes.labelEditor.name") }}</span>
                <input v-if="createMode" id="label-name-input" v-model="modifiedLabel.name" />
                <span v-else> {{ modifiedLabel.name }}</span>
            </label>
            <label class="main-attribute">
                <span>{{ $t("schemes.labelEditor.color") }}</span>
                <ColorMultiInput v-model="modifiedLabel.color" />
            </label>

            <!-- The optional parameters -->
            <div class="attributes-action-bar">
                <h4>{{ $t("schemes.labelEditor.attributes") }}</h4>
                <svg class="add-attribute" @click="addAttribute">
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#plus-bold`"></use>
                </svg>
            </div>

            <AttributeView
                v-for="(attribute, index) in modifiedLabel.attributes"
                :key="`${label.name}-${objectUUID(attribute)}`"
                v-model:name="attribute.name"
                v-model:mandatory="attribute.mandatory"
                v-model:defaultValue="attribute.defaultValue"
                v-model:datatype="attribute.datatype"
                @delete="deleteAttribute(index)"
            />

            <!-- The save button -->
            <div class="bottom-bar">
                <button v-if="!createMode" class="btn btn-warn" @click="deleteLabelDialog = true">
                    {{ $t("schemes.labelEditor.delete") }}
                </button>
                <button v-if="!createMode" class="btn btn-secondary" @click="updateLabel" :disabled="!isModified">
                    {{ $t("schemes.labelEditor.save") }}
                </button>
                <button v-if="createMode" class="btn btn-secondary" @click="createLabel">
                    {{ $t("schemes.labelEditor.create") }}
                </button>
            </div>

            <div class="space"></div>
        </ScrollPanel>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ColorMultiInput from "@/components/ColorMultiInput.vue";
import ApiLabel from "@/models/data-scheme/ApiLabel";
import { deepCopy, errorToast, objectUUID } from "@/utility";
import AttributeView from "@/modules/schemes/components/AttributeView.vue";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";

export default defineComponent({
    name: "LabelEditor",
    components: { AttributeView, ColorMultiInput, ConfirmDialog },
    props: {
        // The label that will be modified
        label: {
            type: Object,
            default: new ApiLabel(),
        },
        // True if the label is currently being created
        createMode: Boolean,
    },
    data() {
        return {
            // The actually modified label
            modifiedLabel: new ApiLabel(),
            // True if the deletion dialog is shown
            deleteLabelDialog: false,
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
            if (this.createMode) this.$nextTick().then(() => document.getElementById("label-name-input")?.focus());
        },
    },
    computed: {
        /**
         * @return True if the label was modified
         */
        isModified(): boolean {
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
         * Forward the object uuid helper method for usage in template
         */
        objectUUID: objectUUID,
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
        /**
         * Save the changed label
         */
        updateLabel(): void {
            if (this.validateLabel())
                this.$store.dispatch("schemes/updateLabel", { label: this.modifiedLabel, force: false });
        },
        /**
         * Delete a label
         */
        async deleteLabel(): Promise<void> {
            this.deleteLabelDialog = false;
            const success = await this.$store.dispatch("schemes/deleteLabel");
            if (!success)
                errorToast(
                    this.$t("schemes.labelEditor.deleteFailed.title"),
                    this.$t("schemes.labelEditor.deleteFailed.description"),
                );
        },
        /**
         * Create a new label
         */
        createLabel(): void {
            if (this.validateLabel()) {
                this.$store.dispatch("schemes/createLabel", this.modifiedLabel);
            }
        },
        /**
         * Check if the label is valid
         */
        validateLabel(): boolean {
            // Check if the name is empty
            if (this.modifiedLabel.name === "") {
                errorToast(
                    this.$t("schemes.labelEditor.nameRequired.title"),
                    this.$t("schemes.labelEditor.nameRequired.description"),
                );
                return false;
            }

            // Check if the name is unique
            for (let label of this.$store.state.schemes.labels) {
                if (label.name === this.modifiedLabel.name && label.name !== this.label.name) {
                    errorToast(
                        this.$t("schemes.labelEditor.nameDuplicate.title"),
                        this.$t("schemes.labelEditor.nameDuplicate.description"),
                    );
                    return false;
                }
            }

            // Check if the attributes are valid
            const names = new Map<string, string>();
            for (let attribute of this.modifiedLabel.attributes) {
                // If the name is empty
                if (attribute.name === "") {
                    errorToast(
                        this.$t("schemes.attribute.nameRequired.title"),
                        this.$t("schemes.attribute.nameRequired.description"),
                    );
                    return false;
                }
                // If the name is a duplicate
                if (names.has(attribute.name)) {
                    errorToast(
                        this.$t("schemes.attribute.nameDuplicate.title"),
                        this.$t("schemes.attribute.nameDuplicate.description", { name: attribute.name }),
                    );
                    return false;
                }
                names.set(attribute.name, "");
            }
            return true;
        },
    },
});
</script>

<style lang="less" scoped>
@import "../../styles/schemes.less";
</style>
