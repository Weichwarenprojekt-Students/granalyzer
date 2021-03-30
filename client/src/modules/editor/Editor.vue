<template>
    <div class="content">
        <EditorHeader class="header"></EditorHeader>
        <OverviewList class="overview"></OverviewList>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { isEmpty } from "@/utility";
import EditorHeader from "@/modules/editor/modules/EditorHeader.vue";
import OverviewList from "@/modules/editor/modules/OverviewList.vue";

export default defineComponent({
    name: "Editor",
    components: {
        EditorHeader,
        OverviewList,
    },
    computed: {
        title(): string {
            const diagram = this.$store.state.editor.diagram;
            if (!isEmpty(diagram)) return diagram;
            else return this.$t("editor.title");
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/styles.less";

.content {
    width: 100%;
    height: 100%;
    background: @light_grey;

    .header {
        width: 100%;
        height: 64px;
        background: white;
    }

    .overview {
        width: @inventory_width;
        height: 100vh;

        position: absolute;
        left: @navbar_width_collapsed;
        top: 0;

        background: white;
    }
}
</style>
