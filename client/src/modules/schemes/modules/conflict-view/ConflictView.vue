<template>
    <div class="content">
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

.content {
    height: 100%;
    border-left: 1px solid @grey;
    padding: 0 16px;

    display: flex;
    flex-flow: column;
}

.underlined-title {
    border-bottom: 2px solid @warn;
}
</style>
