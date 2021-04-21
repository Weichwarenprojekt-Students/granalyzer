<template>
    <div v-if="$store.getters['inspector/isLoaded']" class="content">
        <div class="underlined-title">
            {{ $store.getters["inspector/getName"] }}
        </div>
        <ScrollPanel v-if="$store.state.inspector.attributes.length > 0" class="scroll-panel">
            <ReadAttribute
                v-for="attribute in $store.state.inspector.attributes"
                :key="attribute.name"
                :attribute="attribute"
            ></ReadAttribute>
        </ScrollPanel>
        <h4 v-else class="attribute-item">{{ $t("inspector.noAttributes") }}</h4>
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
    beforeCreate() {
        this.$store.commit("inspector/resetSelection");
    },
});
</script>

<style lang="less" scoped>
@import "styles/inspector";
</style>
