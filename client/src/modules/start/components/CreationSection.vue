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
    name: "CreationSection",
    components: {
        CreationCard,
    },
});
</script>

<style lang="less" scoped>
h2 {
    margin-left: 16px;
}

.cards {
    width: 100%;
    margin: 16px 16px 0 16px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
}
</style>
