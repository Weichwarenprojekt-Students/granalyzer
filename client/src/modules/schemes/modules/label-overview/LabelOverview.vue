<template>
    <div class="content">
        <div class="tabs">
            <div @click="labelsOpen = !labelsOpen" :class="{ 'selected-tab': labelsOpen }">Labels</div>
            <div @click="labelsOpen = !labelsOpen" :class="{ 'selected-tab': !labelsOpen }">Relations</div>
        </div>
        <label class="searchbar">
            <input type="text" placeholder="Search..." />
        </label>
        <ScrollPanel v-if="labelsOpen" class="scroll-panel">
            <div
                :class="['item', { 'selected-item': isLabelSelected(label) }]"
                v-for="label in $store.state.schemes.labels"
                :key="label.name"
                @click="selectLabel(label)"
            >
                {{ label.name }}
            </div>
        </ScrollPanel>
        <ScrollPanel v-if="!labelsOpen" class="scroll-panel">
            <div
                :class="['item', { 'selected-item': isRelationSelected(relation) }]"
                v-for="relation in $store.state.schemes.relations"
                :key="relation.name"
                @click="selectRelation(relation)"
            >
                {{ relation.name }}
            </div>
        </ScrollPanel>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ApiLabel from "@/models/ApiLabel";
import ApiRelation from "@/models/ApiRelation";

export default defineComponent({
    name: "LabelOverview",
    data() {
        return {
            labelsOpen: true,
        };
    },
    beforeCreate() {
        this.$store.dispatch("schemes/loadLabelsAndRelations");
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
        isRelationSelected(relation: ApiRelation): boolean {
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

.selected-tab {
    background: @secondary_color;
    color: white;
}

.searchbar {
    flex: 0 0 auto;
    margin-top: 8px;
}

.scroll-panel {
    margin-top: 8px !important;
    overflow: hidden !important;
    flex: 1 1 auto !important;
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
