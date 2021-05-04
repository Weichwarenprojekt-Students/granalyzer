<template>
    <div class="content">
        <CollapsablePanel :left="true">
            <Overview />
        </CollapsablePanel>
        <div class="mid-content">
            <LabelEditor
                v-if="$store.state.schemes.selectedLabel"
                :label="$store.state.schemes.selectedLabel"
                :createMode="$store.state.schemes.createMode"
            />
            <RelationEditor
                v-else-if="$store.state.schemes.selectedRelation"
                :relation="$store.state.schemes.selectedRelation"
                :createMode="$store.state.schemes.createMode"
            />
            <div v-else class="empty-warning">
                <svg>
                    <use :xlink:href="`${require('@/assets/img/icons.svg')}#info`"></use>
                </svg>
                <div class="message">{{ $t("schemes.nothing-selected") }}</div>
            </div>
        </div>
        <CollapsablePanel :left="false">
            <ConflictView />
        </CollapsablePanel>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Overview from "@/modules/schemes/modules/overview/Overview.vue";
import LabelEditor from "@/modules/schemes/modules/label-editor/LabelEditor.vue";
import ConflictView from "@/modules/schemes/modules/conflict-view/ConflictView.vue";
import RelationEditor from "@/modules/schemes/modules/relation-editor/RelationEditor.vue";
import CollapsablePanel from "@/components/CollapsablePanel.vue";

export default defineComponent({
    name: "Schemes",
    components: { CollapsablePanel, RelationEditor, ConflictView, LabelEditor, Overview },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global.less";

.content {
    display: flex;
    height: 100vh;
    width: 100%;
}

.mid-content {
    flex: 1 1 auto;
    padding: 0 16px;
    display: flex;
    justify-content: center;
}
</style>
