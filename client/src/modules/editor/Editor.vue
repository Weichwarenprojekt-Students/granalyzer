<template>
    <div id="content">
        <h1>{{ title }}</h1>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { isEmpty } from "@/utility";

export default defineComponent({
    name: "Editor",
    computed: {
        title(): string {
            const diagram = this.$store.getters.diagram;
            if (!isEmpty(diagram)) return diagram;
            else return this.$t("editor.title");
        },
    },
});
</script>

<style lang="less" scoped>
@import "../../styles/global.less";

#content {
    padding: 32px;
    margin-left: @navbar_width_collapsed;
    height: 100vh;
    background: @light_grey;
}
</style>
