<template>
    <div v-if="$store.getters['inspector/isLoaded']" class="content">
        <div class="underlined-title">
            {{ $store.state.inspector.element.name }}
        </div>
        <ScrollPanel class="scroll-panel">
            <div v-for="attribute in attributes" :key="attribute.name" class="attribute-item">
                <div class="attribute-key">{{ attribute.name }}:</div>
                <div class="attribute-value">
                    <DynamicInput v-model="attribute.value" :type="attribute.datatype" />
                </div>
            </div>
        </ScrollPanel>
    </div>
    <DefaultInspector v-else />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DefaultInspector from "@/modules/inspector/components/DefaultInspector.vue";
import { InspectorAttribute } from "@/modules/inspector/models/InspectorAttribute";
import { deepCopy } from "@/utility";
import DynamicInput from "@/components/DynamicInput.vue";

export default defineComponent({
    name: "WriteInspector",
    components: {
        DynamicInput,
        DefaultInspector,
    },
    data() {
        return {
            attributes: new Array<InspectorAttribute>(),
        };
    },
    mounted() {
        this.$store.commit("inspector/resetSelection");
    },
    watch: {
        "$store.state.inspector.attributes"() {
            this.attributes = deepCopy(this.$store.state.inspector.attributes);
            if (this.attributes.length > 1) this.attributes[1].value = this.attributes[1].value.toString();
        },
    },
});
</script>

<style lang="less" scoped>
@import "styles/inspector";

.attribute-item {
    align-items: center;
}
</style>
