<template>
    <InputDialog
        @input-confirm="addEmptyDiagram"
        @cancel="dialogAddEmpty = false"
        :show="dialogAddEmpty"
        :image-src="require('@/assets/img/icons.svg') + '#circle-plus'"
        :title="$t('start.diagrams.addDiagram')"
    ></InputDialog>
    <div class="creation-section">
        <h2>{{ $t("start.newDiagram.title") }}</h2>
        <div class="cards">
            <CreationCard
                :title="$t('start.newDiagram.blank.title')"
                :description="$t('start.newDiagram.blank.description')"
                :icon-id="'plus-orange'"
                @card-click="dialogAddEmpty = true"
            ></CreationCard>
            <CreationCard
                :title="$t('start.newDiagram.node.title')"
                :description="$t('start.newDiagram.node.description')"
                :icon-id="'from-diagram'"
                @card-click="dialogAddEmpty = true"
            ></CreationCard>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Diagram } from "@/models/Diagram";
import CreationCard from "./components/CreationCard.vue";
import InputDialog from "@/components/InputDialog.vue";
import { routeNames } from "@/utility";

export default defineComponent({
    name: "CreationSection",
    components: {
        CreationCard,
        InputDialog,
    },
    data() {
        return {
            // True if the dialog should be shown
            dialogAddEmpty: false,
        };
    },
    methods: {
        /**
         * Add an empty diagram
         *
         * @param diagramName The name of the diagram
         */
        async addEmptyDiagram(diagramName: string): Promise<void> {
            if (!diagramName) {
                this.$toast.add({
                    severity: "error",
                    summary: this.$t("start.newDiagram.empty.title"),
                    detail: this.$t("start.newDiagram.empty.description"),
                    life: 3000,
                });
                return;
            }
            this.dialogAddEmpty = false;

            const response = await this.$store.dispatch("start/addDiagram", new Diagram(diagramName));
            if (response.status === 201) {
                this.$store.commit("editor/setActiveDiagram", await response.json());
                await this.$router.push(routeNames.editor);
            }
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global";

.creation-section {
    background: @light_grey;
    width: 100%;
    padding: 32px 64px;
    margin-bottom: 64px;
}

.cards {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
}
</style>
