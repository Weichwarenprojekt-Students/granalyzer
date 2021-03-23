<template>
    <h2>{{ $t("start.newDiagram.title") }}</h2>
    <div class="cards">
        <CreationCard
            :title="$t('start.newDiagram.blank.title')"
            :description="$t('start.newDiagram.blank.description')"
            :imagePath="require('@/assets/img/plus.svg')"
        ></CreationCard>
        <CreationCard
            :title="$t('start.newDiagram.node.title')"
            :description="$t('start.newDiagram.node.description')"
            :imagePath="require('@/assets/img/editor.svg')"
        ></CreationCard>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CreationCard from "./CreationCard.vue";

export default defineComponent({
    name: "Creation",
    components: {
        CreationCard,
    },
});
</script>

<style lang="less" scoped>
.cards {
    margin-top: 32px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
}
</style>
