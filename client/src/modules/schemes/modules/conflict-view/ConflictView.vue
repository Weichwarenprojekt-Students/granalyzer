<template>
    <div class="conflict-view">
        <div class="underlined-title">{{ $t("schemes.conflictView.title") }}</div>
        <ScrollPanel class="scroll-panel">
            <ConflictCard
                v-for="conflict in $store.state.schemes.conflicts"
                :key="conflict.title"
                :conflict="conflict"
            />
        </ScrollPanel>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ConflictCard from "@/modules/schemes/modules/conflict-view/components/ConflictCard.vue";

export default defineComponent({
    name: "ConflictView",
    components: { ConflictCard },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.conflict-view {
    height: 100%;
    padding: 0 16px;
    width: @side_panel_width;
    display: flex;
    flex-flow: column;
}

.underlined-title {
    border-bottom: 2px solid @warn;
}
</style>
