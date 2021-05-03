<template>
    <div v-if="$store.getters['inspector/isLoaded']" class="inspector" @keydown="keydown">
        <!-- The dialog for deleting a node -->
        <ConfirmDialog
            @confirm="deleteItem"
            @cancel="deleteDialog = false"
            :show="deleteDialog"
            :title="$t('inspector.deleteDialog.title')"
            :description="$t('inspector.deleteDialog.description')"
        ></ConfirmDialog>

        <!-- The title -->
        <div v-if="$store.getters['inspector/isNode']" class="underlined-title">
            <input class="name-input" :placeholder="$t('inspector.name')" v-model="element.name" />
        </div>
        <div v-else class="underlined-title">
            {{ element.type }}
        </div>

        <ScrollPanel class="scroll-panel">
            <!-- The type -->
            <div
                v-if="$store.getters['inspector/createMode'] && $store.getters['inspector/isNode']"
                class="attribute-item attribute-item-fixed"
            >
                <div class="attribute-key">
                    {{ $t("inspector.label") }}
                </div>
                <Dropdown
                    :options="$store.state.inspector.types"
                    optionLabel="name"
                    v-model="label"
                    :placeholder="$t('global.dropdown.choose')"
                    :emptyMessage="$t('global.dropdown.empty')"
                />
            </div>
            <div v-else-if="$store.getters['inspector/isNode']" class="attribute-item">
                <div class="attribute-key">
                    {{ $t("inspector.label") }}
                </div>
                <div class="attribute-general">{{ element.label }}</div>
            </div>
            <div v-else class="attribute-item">
                <div class="attribute-key">
                    {{ $t("inspector.relationType") }}
                </div>
                <div class="attribute-general">{{ element.type }}</div>
            </div>

            <!-- The attributes -->
            <div class="attribute-item">
                <div class="attribute-key">
                    {{ $t("inspector.attributes") }}
                </div>
            </div>
            <div v-if="attributes.length <= 0" class="attribute-item no-border">
                {{ $t("inspector.noAttributes") }}
            </div>
            <div
                v-else
                v-for="attribute in attributes"
                :key="`${attribute.name}-${objectUUID(attribute)}`"
                class="attribute-item no-border"
            >
                <Checkbox class="attribute-checkbox" v-model="attribute.active" :binary="true" />
                <div :class="['attribute-key', 'attributes-key', { 'attribute-key-disabled': !attribute.active }]">
                    {{ attribute.name }}
                </div>
                <div class="attribute-value">
                    <DynamicInput
                        v-model="attribute.value"
                        :type="attribute.datatype"
                        :config="attribute.config"
                        :disabled="!attribute.active"
                    />
                </div>
            </div>
            <div v-if="$store.getters['inspector/createMode']" class="bottom-bar">
                <button class="btn btn-secondary" @click="createItem">
                    {{ $t("inspector.create") }}
                </button>
            </div>
            <div v-else class="bottom-bar">
                <button class="btn btn-secondary" :disabled="!isModified" @click="saveItem">
                    {{ $t("inspector.save") }}
                </button>
                <button class="btn btn-warn" @click="deleteDialog = true">
                    {{ $t("inspector.delete") }}
                </button>
            </div>
        </ScrollPanel>
    </div>
    <DefaultInspector v-else class="inspector" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DefaultInspector from "@/modules/inspector/components/DefaultInspector.vue";
import { InspectorAttribute } from "@/modules/inspector/models/InspectorAttribute";
import { deepCopy, errorToast, objectUUID } from "@/utility";
import DynamicInput from "@/components/DynamicInput.vue";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import ApiNode from "@/models/data-scheme/ApiNode";
import ApiRelation from "@/models/data-scheme/ApiRelation";
import ApiLabel from "@/models/data-scheme/ApiLabel";
import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";

export default defineComponent({
    name: "WriteInspector",
    components: {
        ConfirmDialog,
        DynamicInput,
        DefaultInspector,
    },
    data() {
        return {
            // The modified element
            element: {} as unknown,
            // The modified attributes
            attributes: new Array<InspectorAttribute>(),
            // True if the delete dialog is open
            deleteDialog: false,
            // The selected label
            label: {} as ApiLabel,
        };
    },
    beforeCreate() {
        this.$store.commit("inspector/resetSelection");
    },
    watch: {
        /**
         * Check if new element was selected
         */
        "$store.state.inspector.element"() {
            if (this.$store.state.inspector.element instanceof ApiNode) {
                this.element = Object.assign(new ApiNode(), deepCopy(this.$store.state.inspector.element));
                this.label = this.$store.state.inspector.type;
            } else if (this.$store.state.inspector.element instanceof ApiRelation) {
                this.element = Object.assign(new ApiRelation(), deepCopy(this.$store.state.inspector.element));
            } else return;
            this.attributes = deepCopy(this.$store.state.inspector.attributes);
        },
        /**
         * Check if a new label was selected
         */
        label() {
            // Update the element's label
            if (!(this.element instanceof ApiNode) || !this.$store.getters["inspector/createMode"]) return;
            this.element.label = this.label.name;

            // Update the attributes
            this.attributes = this.label.attributes.map(
                (attribute: ApiAttribute) =>
                    new InspectorAttribute(
                        attribute.name,
                        attribute.defaultValue,
                        attribute.datatype,
                        attribute.mandatory,
                        attribute.config,
                    ),
            );
        },
    },
    computed: {
        /**
         * @return True if the item was modified
         */
        isModified(): boolean {
            // Check the name
            if (this.element instanceof ApiNode && this.element.name !== this.$store.state.inspector.element.name)
                return true;

            // Check the attributes
            if (this.$store.state.inspector.attributes.length !== this.attributes.length) return true;
            for (let i = 0; i < this.attributes.length; i++) {
                if (!this.$store.state.inspector.attributes[i].isEqual(this.attributes[i])) return true;
            }
            return false;
        },
    },
    methods: {
        /**
         * Forward the object uuid helper method for usage in template
         */
        objectUUID: objectUUID,
        /**
         * Update the attributes of the item
         */
        updateItem(): void {
            if (this.element instanceof ApiNode || this.element instanceof ApiRelation) {
                this.element.attributes = {};
                for (let attribute of this.attributes)
                    if (attribute.active) this.element.attributes[attribute.name] = attribute.value;
            }
        },
        /**
         * Create item
         */
        createItem(): void {
            this.updateItem();
            if (!(this.element instanceof ApiNode)) return;

            // Validate content
            if (this.element.name.length < 1) {
                errorToast(this.$t("inspector.nameRequired.title"), this.$t("inspector.nameRequired.description"));
                return;
            }

            // Validate label
            if (this.$store.state.inspector.types.length <= 0) {
                errorToast(this.$t("inspector.labelInvalid.title"), this.$t("inspector.labelInvalid.description"));
                return;
            }

            // Actually create the new item
            this.$store.dispatch("inspector/createNode", this.element);
        },
        /**
         * Save item changes
         */
        saveItem(): void {
            this.updateItem();

            // Validate content
            if (this.element instanceof ApiNode && this.element.name.length < 1) {
                errorToast(this.$t("inspector.nameRequired.title"), this.$t("inspector.nameRequired.description"));
                return;
            }

            if (this.element instanceof ApiNode) this.$store.dispatch("inspector/updateNode", this.element);
            else if (this.element instanceof ApiRelation)
                this.$store.dispatch("inspector/updateRelation", this.element);
        },
        /**
         * Delete item
         */
        deleteItem(): void {
            this.deleteDialog = false;
            if (this.element instanceof ApiNode) this.$store.dispatch("inspector/deleteNode", this.element);
            else if (this.element instanceof ApiRelation)
                this.$store.dispatch("inspector/deleteRelation", this.element);
        },
        /**
         * Check if enter key was pressed
         */
        keydown(evt: KeyboardEvent): void {
            if (evt.code === "Enter") {
                (evt.target as HTMLElement).blur();
                if (this.$store.getters["inspector/createMode"]) this.createItem();
                else this.saveItem();
            }
        },
    },
});
</script>

<style lang="less" scoped>
@import "styles/inspector";

.name-input {
    font-size: @h3;
    padding: 8px 16px;
    background: @light_grey;
    border: 0;
    width: 100%;
}

.attribute-key-disabled {
    text-decoration: line-through;
}

.bottom-bar {
    border-top: 1px solid @grey;
    margin-right: 18px;
    padding: 16px;
    gap: 12px;
    display: flex;
    flex-direction: row-reverse;
}

.attribute-item {
    align-items: center;
}

.attribute-key {
    flex: 0 0 auto;
    min-width: 0;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}

.attributes-key {
    flex: 1 1 auto;
}

.attribute-value {
    text-align: start;
}
</style>
