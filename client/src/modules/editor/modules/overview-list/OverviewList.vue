<template>
    <div class="content">
        <div class="title">Node Overview</div>
        <label class="searchbar">
            <input type="text" placeholder="Search..." />
        </label>
        <ScrollPanel class="scroll-panel">
            <OverviewItem
                v-for="content in $store.state.editor.nodes"
                :key="content.id"
                :name="content.name"
                :label="content.label"
                :attribtues="content.attributes"
                :nodeId="content.id"
                :color="getColorByLabel(content.label)"
            />
            <div class="space"></div>
        </ScrollPanel>
        <!--<div class="button">Add Node</div>-->
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import OverviewItem from "@/modules/editor/modules/overview-list/components/OverviewItem.vue";
import Label from "@/modules/editor/models/Label";

export default defineComponent({
    name: "OverviewList",
    components: { OverviewItem },
    created() {
        this.$store.dispatch("editor/loadNodes");
    },
    methods: {
        /**
         * Gets the color that corresponds to a label
         */
        getColorByLabel(label: string): string {
            const element = this.$store.state.editor.labels.find((element: Label) => element.name === label);
            return element?.color ? element.color : "#FFFFFF";
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/styles.less";

.content {
    height: 100%;
    border-right: 1px solid @grey;
    padding: 0 16px;

    display: flex;
    flex-flow: column;
}

.title {
    flex: 0 0 auto;

    font-size: @h2;
    display: flex;
    align-items: center;
    border-bottom: 2px solid @primary_color;

    height: 64px;
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
        height: 20px;
    }
}

.button {
    width: 128px;
    height: 40px;
    font-size: @h3;
    padding-right: 8px;

    position: absolute;
    bottom: 16px;
    right: 16px;

    border: 1px solid @dark;
}
</style>
