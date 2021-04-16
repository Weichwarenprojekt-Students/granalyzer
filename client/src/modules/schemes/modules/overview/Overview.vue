<template>
    <div class="content">
        <!-- The navigation bar -->
        <div class="tabs">
            <div @click="labelsOpen = !labelsOpen" :class="{ 'selected-tab': labelsOpen }">
                {{ $t("schemes.overview.labels") }}
            </div>
            <div @click="labelsOpen = !labelsOpen" :class="{ 'selected-tab': !labelsOpen }">
                {{ $t("schemes.overview.relations") }}
            </div>
        </div>

        <!-- The labels tab -->
        <div v-if="labelsOpen" class="tab-content">
            <label class="searchbar">
                <input v-model="labelFilter" type="text" placeholder="Search..." />
            </label>

            <!-- The warning if there are no labels -->
            <div v-if="labels.length === 0" class="empty-warning">
                <svg>
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#not-found`"></use>
                </svg>
                <div class="message">{{ $t("schemes.overview.noLabels") }}</div>
            </div>

            <!-- The actual list -->
            <ScrollPanel class="scroll-panel">
                <div
                    :class="['item', { 'selected-item': isLabelSelected(label) }]"
                    v-for="label in labels"
                    :key="label.name"
                    @click="selectLabel(label)"
                >
                    {{ label.name }}
                </div>

                <div class="add-button" @click="newLabel">
                    <svg>
                        <use :xlink:href="`${require('@/assets/img/icons.svg')}#plus-bold`"></use>
                    </svg>
                    <span> {{ $t("schemes.overview.addLabel") }} </span>
                </div>

                <div class="space" />
            </ScrollPanel>
        </div>

        <!-- The relations tab -->
        <div v-if="!labelsOpen" class="tab-content">
            <label class="searchbar">
                <input v-model="relationFilter" type="text" placeholder="Search..." />
            </label>

            <!-- The warning if there are no relations -->
            <div v-if="relations.length === 0" class="empty-warning">
                <svg>
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#not-found`"></use>
                </svg>
                <div class="message">{{ $t("schemes.overview.noRelations") }}</div>
            </div>

            <!-- The actual list -->
            <ScrollPanel class="scroll-panel">
                <div
                    :class="['item', { 'selected-item': isRelationSelected(relation) }]"
                    v-for="relation in relations"
                    :key="relation.name"
                    @click="selectRelation(relation)"
                >
                    {{ relation.name }}
                </div>

                <div class="add-button" @click="newRelation">
                    <svg>
                        <use :xlink:href="`${require('@/assets/img/icons.svg')}#plus-bold`"></use>
                    </svg>
                    <span> {{ $t("schemes.overview.addRelation") }} </span>
                </div>

                <div class="space" />
            </ScrollPanel>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ApiLabel from "@/models/data-scheme/ApiLabel";
import { ApiRelationType } from "@/models/data-scheme/ApiRelationType";

export default defineComponent({
    name: "Overview",
    data() {
        return {
            // True if the labels tab is active
            labelsOpen: true,
            // The filtered labels
            labels: new Array<ApiLabel>(),
            // The filtered relations
            relations: new Array<ApiRelationType>(),
            // The filter string for the labels
            labelFilter: "",
            // The filter string for the relations
            relationFilter: "",
        };
    },
    async beforeCreate() {
        await this.$store.dispatch("schemes/loadLabelsAndRelations");
        this.labels = this.$store.state.schemes.labels;
        this.relations = this.$store.state.schemes.relations;
    },
    watch: {
        /**
         * Check if the original labels changed
         */
        "$store.state.schemes.labels"() {
            this.labelFilter = "";
            this.labels = this.$store.state.schemes.labels;
        },
        /**
         * Check if the original relations changed
         */
        "$store.state.schemes.relations"() {
            this.relationFilter = "";
            this.relations = this.$store.state.schemes.relations;
        },
        /**
         * Filter the labels as soon as the label filter changes
         */
        labelFilter() {
            this.labels = this.$store.state.schemes.labels.filter((label: ApiLabel) =>
                label.name.toLowerCase().includes(this.labelFilter.toLowerCase()),
            );
        },
        /**
         * Filter the relations as soon as the relation filter changes
         */
        relationFilter() {
            this.relations = this.$store.state.schemes.relations.filter((relation: ApiRelationType) =>
                relation.name.toLowerCase().includes(this.relationFilter.toLowerCase()),
            );
        },
    },
    methods: {
        /**
         * Check if a given label is selected
         *
         * @param label The label that shall be checked
         */
        isLabelSelected(label: ApiLabel): boolean {
            return this.$store.state.schemes.selectedLabel?.name === label.name;
        },
        /**
         * Check if a given label is selected
         *
         * @param relation The label that shall be checked
         */
        isRelationSelected(relation: ApiRelationType): boolean {
            return this.$store.state.schemes.selectedRelation?.name === relation.name;
        },
        /**
         * Select a label when clicked
         *
         * @param label The clicked label
         */
        selectLabel(label: ApiLabel): void {
            this.$store.commit("schemes/selectLabel", label);
        },
        /**
         * Select a relation when clicked
         *
         * @param relation The clicked relation
         */
        selectRelation(relation: ApiLabel): void {
            this.$store.commit("schemes/selectRelation", relation);
        },
        /**
         * Create a new label
         */
        newLabel(): void {
            this.$store.commit("schemes/initLabelCreation");
        },
        /**
         * Create a new relation
         */
        newRelation(): void {
            this.$store.commit("schemes/initRelationCreation");
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.content {
    height: 100%;
    border-right: 1px solid @grey;
    padding: 0 16px;

    display: flex;
    flex-flow: column;
    position: relative;
}

.tabs {
    display: flex;
    height: @header-height;
    padding-top: 12px;
    border-bottom: 2px solid @secondary_color;

    div {
        flex: 1 1 auto;
        font-size: @h3;
        cursor: pointer;
        text-align: center;
        line-height: @header-height - 12px;
    }
}

.add-button {
    display: flex;
    margin-top: 24px;
    margin-right: 18px;
    gap: 12px;
    padding-left: 16px;
    cursor: pointer;

    svg {
        width: 16px;
        height: 16px;
    }
}

.selected-tab {
    background: @secondary_color;
}

.tab-content {
    overflow: hidden;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
}

.searchbar {
    flex: 0 0 auto;
    margin-top: 8px;
}

.scroll-panel {
    margin-top: 8px !important;
    overflow: hidden !important;
    flex: 1 1 auto !important;

    .space {
        padding-bottom: 48px;
    }
}

.item {
    border-bottom: 1px solid @grey;
    padding: 12px 24px 12px 16px;
    cursor: pointer;

    &:hover {
        background: @accent_color;
    }
}

.selected-item {
    background: @secondary_color;

    &:hover {
        background: @secondary_color;
    }
}
</style>