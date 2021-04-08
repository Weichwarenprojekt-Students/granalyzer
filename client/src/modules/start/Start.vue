<template>
    <ScrollPanel class="content">
        <CreationSection></CreationSection>
        <DiagramExplorer></DiagramExplorer>
    </ScrollPanel>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CreationSection from "@/modules/start/modules/creation-section/CreationSection.vue";
import DiagramExplorer from "@/modules/start/modules/diagram-explorer/DiagramExplorer.vue";

export default defineComponent({
    name: "Start",
    components: {
        CreationSection,
        DiagramExplorer,
    },
});
</script>

<style lang="less">
.content {
    height: 100%;
    overflow: hidden;
}
</style>
