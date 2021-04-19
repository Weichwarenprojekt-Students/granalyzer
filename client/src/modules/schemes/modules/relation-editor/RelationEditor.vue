<template>
    <div class="content">
        <!-- The dialog for deleting a relation -->
        <ConfirmDialog
            @confirm="deleteRelation"
            @cancel="deleteRelationDialog = false"
            :show="deleteRelationDialog"
            :title="$t('schemes.relationEditor.deleteDialog.title')"
            :description="$t('schemes.relationEditor.deleteDialog.description')"
        ></ConfirmDialog>

        <div class="underlined-title">
            {{ $t("schemes.relationEditor.title") }}
        </div>
        <ScrollPanel class="scroll-panel">
            <!-- The main attributes -->
            <label class="main-attribute">
                <span>{{ $t("schemes.relationEditor.name") }}</span>
                <input v-if="createMode" id="relation-name-input" v-model="modifiedRelation.name" />
                <span v-else> {{ modifiedRelation.name }}</span>
            </label>

            <!-- The optional parameters -->
            <div class="attributes-action-bar">
                <h4>{{ $t("schemes.relationEditor.attributes") }}</h4>
                <svg class="add-attribute" @click="addAttribute">
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#plus-bold`"></use>
                </svg>
            </div>

            <AttributeView
                v-for="(attribute, index) in modifiedRelation.attributes"
                :key="`${relation.name}-${objectUUID(attribute)}`"
                v-model:name="attribute.name"
                v-model:mandatory="attribute.mandatory"
                v-model:defaultValue="attribute.defaultValue"
                v-model:datatype="attribute.datatype"
                @delete="deleteAttribute(index)"
            />

            <!-- The optional parameters -->
            <div class="attributes-action-bar">
                <h4>{{ $t("schemes.relationEditor.connections") }}</h4>
                <svg class="add-attribute" @click="addConnection">
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#plus-bold`"></use>
                </svg>
            </div>

            <ConnectionView
                v-for="(connection, index) in modifiedRelation.connections"
                :key="`${connection.name}-${objectUUID(connection)}`"
                v-model:from="connection.from"
                v-model:to="connection.to"
                @delete="deleteConnection(index)"
            />

            <!-- The save button -->
            <div class="bottom-bar">
                <button v-if="!createMode" class="btn btn-warn" @click="deleteRelationDialog = true">
                    {{ $t("schemes.relationEditor.delete") }}
                </button>
                <button v-if="!createMode" class="btn btn-secondary" @click="updateRelation" :disabled="!isModified">
                    {{ $t("schemes.relationEditor.save") }}
                </button>
                <button v-if="createMode" class="btn btn-secondary" @click="createRelation">
                    {{ $t("schemes.relationEditor.create") }}
                </button>
            </div>
        </ScrollPanel>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { deepCopy, errorToast, objectUUID } from "@/utility";
import AttributeView from "@/modules/schemes/components/AttributeView.vue";
import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";
import { ApiConnection } from "@/models/data-scheme/ApiConnection";
import { ApiRelationType } from "@/models/data-scheme/ApiRelationType";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
import ConnectionView from "@/modules/schemes/modules/relation-editor/components/ConnectionView.vue";

export default defineComponent({
    name: "RelationEditor",
    components: { ConnectionView, AttributeView, ConfirmDialog },
    props: {
        // The relation that will be modified
        relation: {
            type: Object,
            default: new ApiRelationType(),
        },
        // True if the relation is currently being created
        createMode: Boolean,
    },
    data() {
        return {
            // The actually modified relation
            modifiedRelation: new ApiRelationType(),
            // True if the deletion dialog is shown
            deleteRelationDialog: false,
        };
    },
    created() {
        this.modifiedRelation = deepCopy(this.relation) as ApiRelationType;
    },
    watch: {
        /**
         * Check if the input changed
         */
        relation() {
            this.modifiedRelation = deepCopy(this.relation) as ApiRelationType;
            if (this.createMode) this.$nextTick().then(() => document.getElementById("relation-name-input")?.focus());
        },
    },
    computed: {
        /**
         * @return True if the relation was modified
         */
        isModified(): boolean {
            if (this.relation.attributes.length != this.modifiedRelation.attributes.length) return true;
            for (let i = 0; i < this.modifiedRelation.attributes.length; i++)
                if (!ApiAttribute.isEqual(this.modifiedRelation.attributes[i], this.relation.attributes[i]))
                    return true;
            if (this.relation.connections.length != this.modifiedRelation.connections.length) return true;
            for (let i = 0; i < this.modifiedRelation.connections.length; i++)
                if (!ApiConnection.isEqual(this.modifiedRelation.connections[i], this.relation.connections[i]))
                    return true;
            return this.relation.name != this.modifiedRelation.name;
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
            this.modifiedRelation.attributes.splice(index, 1);
        },
        /**
         * Delete an connection by index
         *
         * @param index The index of the connection
         */
        deleteConnection(index: number): void {
            this.modifiedRelation.connections.splice(index, 1);
        },
        /**
         * Add a new attribute
         */
        addAttribute(): void {
            this.modifiedRelation.attributes.push(new ApiAttribute(this.$t("schemes.attribute.new")));
        },
        /**
         * Add a new connection
         */
        addConnection(): void {
            this.modifiedRelation.connections.push(new ApiConnection("-", "-"));
        },
        /**
         * Save the changed relation
         */
        updateRelation(): void {
            if (this.validateRelation())
                this.$store.dispatch("schemes/updateRelation", { relation: this.modifiedRelation, force: false });
        },
        /**
         * Delete a relation
         */
        async deleteRelation(): Promise<void> {
            this.deleteRelationDialog = false;
            const success = await this.$store.dispatch("schemes/deleteRelation");
            if (!success)
                errorToast(
                    this.$t("schemes.relationEditor.deleteFailed.title"),
                    this.$t("schemes.relationEditor.deleteFailed.description"),
                );
        },
        /**
         * Create a new relation
         */
        createRelation(): void {
            if (this.validateRelation()) {
                this.$store.dispatch("schemes/createRelation", this.modifiedRelation);
            }
        },
        /**
         * Check if the relation is valid
         */
        validateRelation(): boolean {
            if (!this.validateRelationName()) return false;
            if (!this.validateRelationAttributes()) return false;
            return this.validateRelationConnections();
        },
        /**
         * @return True if the name is valid
         */
        validateRelationName(): boolean {
            // Check if the name is empty
            if (this.modifiedRelation.name === "") {
                errorToast(
                    this.$t("schemes.relationEditor.nameRequired.title"),
                    this.$t("schemes.relationEditor.nameRequired.description"),
                );
                return false;
            }

            // Check if the name is unique
            for (let relation of this.$store.state.schemes.relations) {
                if (relation.name === this.modifiedRelation.name && relation.name !== this.relation.name) {
                    errorToast(
                        this.$t("schemes.relationEditor.nameDuplicate.title"),
                        this.$t("schemes.relationEditor.nameDuplicate.description"),
                    );
                    return false;
                }
            }
            return true;
        },
        /**
         * @return True if the attributes are valid
         */
        validateRelationAttributes(): boolean {
            // Check if the attributes are valid
            const names = new Map<string, string>();
            for (let attribute of this.modifiedRelation.attributes) {
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
        /**
         * @return True if the connections are valid
         */
        validateRelationConnections(): boolean {
            for (let connection of this.modifiedRelation.connections) {
                // True if the label specified in "from" actually exists
                let fromExists = false;
                // True if the label specified in "to" actually exists
                let toExists = false;

                for (let label of this.$store.state.schemes.labels) {
                    if (connection.from === label.name) fromExists = true;
                    if (connection.to === label.name) toExists = true;
                }

                // If one of the labels doesn't exist show a message
                if (!fromExists) {
                    errorToast(
                        this.$t("schemes.relationEditor.connectionInvalid.title"),
                        this.$t("schemes.relationEditor.connectionInvalid.description", {
                            name: connection.from,
                        }),
                    );
                    return false;
                }
                if (!toExists) {
                    errorToast(
                        this.$t("schemes.relationEditor.connectionInvalid.title"),
                        this.$t("schemes.relationEditor.connectionInvalid.description", {
                            name: connection.to,
                        }),
                    );
                    return false;
                }
            }
            return true;
        },
    },
});
</script>

<style lang="less" scoped>
@import "../../styles/schemes.less";
</style>
