<template>
    <h2>{{ $t("start.newDiagram.title") }}</h2>
    <div class="cards">
        <CreationCard
            :title="$t('start.newDiagram.blank.title')"
            :description="$t('start.newDiagram.blank.description')"
            :imagePath="require('@/assets/img/plus.svg')"
            @click="dialogAddEmpty = true"
        ></CreationCard>
        <CreationCard
            :title="$t('start.newDiagram.node.title')"
            :description="$t('start.newDiagram.node.description')"
            :imagePath="require('@/assets/img/editor.svg')"
            @click="dialogAddEmpty = true"
        ></CreationCard>
        <ConfirmDialog
            @confirm="addEmptyDiagram"
            @cancel="dialogAddEmpty = false"
            :show="dialogAddEmpty"
            title="Add Diagram"
            description="Are you sure you want to add an empty diagram?"
        ></ConfirmDialog>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CreationCard from "./CreationCard.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

export default defineComponent({
    name: "CreationSection",
    components: {
        CreationCard,
        ConfirmDialog,
    },
    data() {
        return {
            dialogAddEmpty: false,
        };
    },
    methods: {
        addEmptyDiagram() {
            this.$toast.add({
                severity: "success",
                summary: "Added Diagram",
                detail: "Added an empty diagram!",
                life: 3000,
            });
            this.dialogAddEmpty = false;
        },
    },
});
</script>

<style lang="less" scoped>
h2 {
    margin-left: 16px;
}

.cards {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
}
</style>
