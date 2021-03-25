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
            :imagePath="require('@/assets/img/editor-thin.svg')"
            @click="dialogAddEmpty = true"
        ></CreationCard>
        <InputDialog
            @input-confirm="addEmptyDiagram"
            @cancel="dialogAddEmpty = false"
            :show="dialogAddEmpty"
            title="Add Diagram"
        ></InputDialog>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Diagram } from "@/modules/start/models/Diagram";
import CreationCard from "./components/CreationCard.vue";
import InputDialog from "@/components/InputDialog.vue";

export default defineComponent({
    name: "CreationSection",
    components: {
        CreationCard,
        InputDialog,
    },
    data() {
        return {
            dialogAddEmpty: false,
        };
    },
    methods: {
        /**
         * Add an empty diagram
         *
         * @param diagramName The name of the diagram
         */
        addEmptyDiagram(diagramName: string): void {
            this.$toast.add({
                severity: "success",
                summary: "Added Diagram",
                detail: "Added an empty diagram!",
                life: 3000,
            });
            this.dialogAddEmpty = false;
            this.$store.dispatch("addDiagram", new Diagram(diagramName));
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
