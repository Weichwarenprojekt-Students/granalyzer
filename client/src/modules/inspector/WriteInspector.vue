<template>
    <div v-if="$store.getters['inspector/isLoaded']" class="content">
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
            <input class="name-input" v-model="element.name" />
        </div>
        <div v-else class="underlined-title">
            {{ element.type }}
        </div>

        <ScrollPanel class="scroll-panel">
            <!-- The type -->
            <div v-if="$store.getters['inspector/isNode']" class="attribute-item">
                <div class="attribute-key">
                    {{ $t("inspector.label") }}
                </div>
                <Dropdown :value="element.label">
                    <div v-for="type in $store.state.inspector.types" :key="type.name" @click="selectLabel(type)">
                        {{ type.name }}
                    </div>
                </Dropdown>
            </div>
            <div v-else class="attribute-item">
                <div class="attribute-key">
                    {{ $t("inspector.relationType") }}
                </div>
                <Dropdown :value="element.type">
                    <div
                        v-for="type in $store.state.inspector.types"
                        :key="type.name"
                        @click="selectRelationType(type)"
                    >
                        {{ type.name }}
                    </div>
                </Dropdown>
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
                <div :class="['attribute-key', { 'attribute-key-disabled': !attribute.active }]">
                    {{ attribute.name }}
                </div>
                <div class="attribute-value">
                    <DynamicInput v-model="attribute.value" :type="attribute.datatype" :disabled="!attribute.active" />
                </div>
            </div>
            <div class="bottom-bar">
                <button v-if="$store.getters['inspector/createMode']" class="btn btn-secondary" @click="createItem">
                    {{ $t("inspector.create") }}
                </button>
                <button v-else class="btn btn-secondary" :disabled="!isModified" @click="saveItem">
                    {{ $t("inspector.save") }}
                </button>
                <button class="btn btn-warn" @click="deleteDialog = true">
                    {{ $t("inspector.delete") }}
                </button>
            </div>
        </ScrollPanel>
    </div>
    <DefaultInspector v-else />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DefaultInspector from "@/modules/inspector/components/DefaultInspector.vue";
import { InspectorAttribute } from "@/modules/inspector/models/InspectorAttribute";
import { deepCopy, objectUUID } from "@/utility";
import DynamicInput from "@/components/DynamicInput.vue";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import Dropdown from "@/components/Dropdown.vue";
import ApiNode from "@/models/data-scheme/ApiNode";
import ApiRelation from "@/models/data-scheme/ApiRelation";
import ApiLabel from "@/models/data-scheme/ApiLabel";
import { ApiRelationType } from "@/models/data-scheme/ApiRelationType";
import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";

export default defineComponent({
    name: "WriteInspector",
    components: {
        Dropdown,
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
        };
    },
    beforeCreate() {
        this.$store.commit("inspector/resetSelection");
    },
    watch: {
        "$store.state.inspector.element"() {
            if (this.$store.state.inspector.element instanceof ApiNode) {
                this.element = Object.assign(new ApiNode(), deepCopy(this.$store.state.inspector.element));
            } else {
                this.element = Object.assign(new ApiRelation(), deepCopy(this.$store.state.inspector.element));
            }
            this.attributes = deepCopy(this.$store.state.inspector.attributes);
        },
    },
    computed: {
        /**
         * @return True if the item was modified
         */
        isModified(): boolean {
            // Check the name label and type
            if (this.element instanceof ApiNode) {
                if (this.element.name !== this.$store.state.inspector.element.name) return true;
                if (this.element.label !== this.$store.state.inspector.element.label) return true;
            } else if (this.element instanceof ApiRelation) {
                if (this.element.type !== this.$store.state.inspector.element.type) return true;
            }

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
         * Select a new label
         */
        selectLabel(label: ApiLabel): void {
            if (!(this.element instanceof ApiNode)) return;
            this.element.label = label.name;
            this.updateAttributes(label);
        },
        /**
         * Select a new relation type
         */
        selectRelationType(relation: ApiRelationType): void {
            if (!(this.element instanceof ApiRelation)) return;
            this.element.type = relation.name;
            this.updateAttributes(relation);
        },
        /**
         * Update attributes after type switch
         */
        updateAttributes(type: ApiLabel | ApiRelationType): void {
            this.attributes = type.attributes.map(
                (attribute: ApiAttribute) =>
                    new InspectorAttribute(
                        attribute.name,
                        attribute.defaultValue,
                        attribute.datatype,
                        attribute.mandatory,
                    ),
            );
        },
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
            if (this.element instanceof ApiNode) this.$store.dispatch("inspector/createLabel", this.element);
            else if (this.element instanceof ApiRelation)
                this.$store.dispatch("inspector/createRelation", this.element);
        },
        /**
         * Save item changes
         */
        saveItem(): void {
            this.updateItem();
            if (this.element instanceof ApiNode) this.$store.dispatch("inspector/updateLabel", this.element);
            else if (this.element instanceof ApiRelation)
                this.$store.dispatch("inspector/updateRelation", this.element);
        },
        /**
         * Delete item
         */
        deleteItem(): void {
            return;
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

.attribute-item {
    align-items: center;
    height: 50px;
}

.no-border {
    border: 0;
}

.attribute-key {
    flex: 1 1 auto;
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
</style>
