<template>
    <div v-if="$store.getters['inspector/isLoaded']" class="content">
        <div class="underlined-title">
            {{ $store.state.inspector.element.name }}
        </div>
        <ScrollPanel class="scroll-panel">
            <ReadAttribute
                v-for="attribute in $store.state.inspector.attributes"
                :key="attribute.name"
                :attribute="attribute"
            ></ReadAttribute>
        </ScrollPanel>
    </div>
    <DefaultInspector v-else />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DefaultInspector from "@/modules/inspector/components/DefaultInspector.vue";
import ReadAttribute from "@/modules/inspector/components/ReadAttribute.vue";

export default defineComponent({
    name: "ReadInspector",
    components: {
        DefaultInspector,
        ReadAttribute,
    },
    mounted() {
        this.$store.commit("inspector/resetSelection");
    },
});
</script>

<style lang="less" scoped>
@import "styles/inspector";
</style>
