<template>
    <!-- Labels -->
    <div class="label" :id="content.label" @click="onClick($event)">
        {{ content.label }}
    </div>

    <!-- Nodes related to the label -->
    <div class="label node" :id="node.id" v-for="node in content.nodes" :key="node" @click="onClick($event)">
        {{ node.name }}
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "OverviewItem",
    props: {
        // Labels and nodes of the customer db
        content: Object,
    },
    methods: {
        /**
         * Handles onClick event on an item in the node overview
         */
        // eslint-disable-next-line
        onClick(event: any) {
            const selectedId = this.$store.state.editor.selectedItemId;
            const eventId = event.currentTarget.id;

            // Deselect previously selected elements
            if (selectedId !== "") document.getElementById(selectedId)?.classList.remove("selected");

            // Deselect if selected item is clicked
            if (selectedId === eventId) {
                document.getElementById(selectedId)?.classList.remove("selected");
                this.$store.commit("editor/setSelectedItem", "");
                return;
            }

            // Toggle selection class and update store
            this.$store.commit("editor/setSelectedItem", eventId);
            event.currentTarget.classList.add("selected");
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/styles.less";

.label {
    height: 60px;
    padding-left: 16px;
    display: flex;
    align-items: center;
    font-size: @h3;
    border-bottom: 1px solid @grey;
    cursor: pointer;

    &:hover {
        background: @accent_color;
    }
}

.node {
    font-size: @h3 - 2px;
    padding-left: 32px;
}

.selected {
    background: @secondary_color;

    &:hover {
        background: @secondary_color;
    }
}
</style>
