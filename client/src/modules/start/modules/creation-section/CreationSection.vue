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
            @click="dialogConfirm = true"
        ></CreationCard>
        <InputDialog
            @input-confirm="addEmptyDiagram"
            @cancel="dialogAddEmpty = false"
            :show="dialogAddEmpty"
            title="Test"
        ></InputDialog>
        <ConfirmDialog
            @input-confirm="addEmptyDiagram"
            @cancel="dialogConfirm = false"
            :show="dialogConfirm"
            title="Test"
            description="Test2"
        ></ConfirmDialog>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CreationCard from "./components/CreationCard.vue";
import InputDialog from "@/components/InputDialog.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

export default defineComponent({
    name: "CreationSection",
    components: {
        CreationCard,
        InputDialog,
        ConfirmDialog,
    },
    data() {
        return {
            dialogAddEmpty: false,
            dialogConfirm: false,
        };
    },
    methods: {
        addEmptyDiagram(diagramName: string): void {
            this.$toast.add({
                severity: "success",
                summary: "Added Diagram",
                detail: "Added an empty diagram!",
                life: 3000,
            });
            this.dialogAddEmpty = false;
            console.log(diagramName);
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
