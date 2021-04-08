<template>
    <div class="content">
        <LabelOverview class="overview" />
        <div class="mid-content">
            <LabelEditor v-if="$store.state.schemes.selectedLabel" />
            <RelationEditor v-else-if="$store.state.schemes.selectedRelation" />
            <div v-else class="empty-warning">
                <svg>
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#info`"></use>
                </svg>
                <div class="message">{{ $t("schemes.nothing-selected") }}</div>
            </div>
        </div>
        <ConflictView class="conflict-view" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import LabelOverview from "@/modules/schemes/modules/label-overview/LabelOverview.vue";
import LabelEditor from "@/modules/schemes/modules/label-editor/LabelEditor.vue";
import ConflictView from "@/modules/schemes/modules/conflict-view/ConflictView.vue";
import RelationEditor from "@/modules/schemes/modules/relation-editor/RelationEditor.vue";

export default defineComponent({
    name: "Schemes",
    components: { RelationEditor, ConflictView, LabelEditor, LabelOverview },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.content {
    display: flex;
    height: 100vh;
    width: 100%;
}

.overview {
    width: @inventory_width;
    height: 100%;
    flex: 0 0 auto;
}

.mid-content {
    flex: 1 1 auto;
    padding: 0 16px;
}

.conflict-view {
    width: @inventory_width;
    flex: 0 0 auto;
}
</style>
