<template>
    <div v-if="$store.getters['inspector/isLoaded']" class="content nested-content">
        <ScrollPanel class="scroll-panel">
            <!-- The label -->
            <div v-if="$store.getters['inspector/isNode']" class="attribute-item">
                <div class="attribute-key">
                    {{ $t("inspector.name") }}
                </div>
                <div>{{ $store.getters["inspector/getName"] }}</div>
            </div>

            <!-- The label -->
            <div v-if="$store.getters['inspector/isNode']" class="attribute-item">
                <div class="attribute-key">
                    {{ $t("inspector.label") }}
                </div>
                <div>{{ $store.state.inspector.element.label }}</div>
            </div>
            <div v-else class="attribute-item">
                <div class="attribute-key">
                    {{ $t("inspector.relationType") }}
                </div>
                <div>{{ $store.state.inspector.element.type }}</div>
            </div>

            <!-- The attributes -->
            <div class="attribute-item">
                <div class="attribute-key">
                    {{ $t("inspector.attributes") }}
                </div>
            </div>
            <div v-if="$store.state.inspector.attributes.length <= 0" class="attribute-item no-border">
                {{ $t("inspector.noAttributes") }}
            </div>
            <ReadAttribute
                v-else
                v-for="attribute in $store.state.inspector.attributes"
                :key="attribute.name"
                :attribute="attribute"
            ></ReadAttribute>
            <HeatMap />
        </ScrollPanel>
    </div>
    <DefaultInspector v-else :title="false" :visual-info="$store.state.inspector.visualSelection" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DefaultInspector from "@/modules/inspector/components/DefaultInspector.vue";
import ReadAttribute from "@/modules/inspector/components/ReadAttribute.vue";
import HeatMap from "@/modules/editor/modules/heatmap/HeatMap.vue";

export default defineComponent({
    name: "ReadInspector",
    components: {
        HeatMap,
        DefaultInspector,
        ReadAttribute,
    },
});
</script>

<style lang="less" scoped>
@import "styles/inspector";

.content {
    border: 0;
    padding: 0;
}
</style>
