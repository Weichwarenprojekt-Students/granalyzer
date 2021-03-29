<template>
    <div class="content">
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
            const diagram = this.$store.state.editor.diagram;
            if (!isEmpty(diagram)) return diagram;
            else return this.$t("editor.title");
        },
    },
});
</script>

<style lang="less" scoped>
@import "../../styles/styles.less";

.content {
    width: 100%;
    height: 100%;
    background: @light_grey;
    padding: 32px;
}
</style>
