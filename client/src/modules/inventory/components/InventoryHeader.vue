<template>
    <div class="header">
        <InputDialog
            @input-confirm="createDiagram"
            @cancel="dialogAddDiagram = false"
            :show="dialogAddDiagram"
            :image-src="require('@/assets/img/icons.svg') + '#circle-plus'"
            :title="$t('inventory.createDiagram')"
        ></InputDialog>
        <h3>{{ $t("inventory.header.title") }}</h3>
        <button
            :disabled="!$store.state.inventory.selectedNode || $store.state.inventory.loading"
            class="btn btn-secondary btn-icon"
            @click="dialogAddDiagram = true"
        >
            <svg>
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#plus-bold`"></use>
            </svg>
            {{ $t("inventory.createDiagram") }}
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import InputDialog from "@/components/dialog/InputDialog.vue";
import { errorToast, routeNames } from "@/utility";
import { ApiDiagram } from "@/models/ApiDiagram";

export default defineComponent({
    name: "InventoryHeader",
    components: { InputDialog },
    data() {
        return {
            // True, if dialog is shown
            dialogAddDiagram: false,
        };
    },
    methods: {
        /**
         * Creates a diagram from the current neighbor graph
         */
        async createDiagram(diagramName: string): Promise<void> {
            if (!diagramName) {
                errorToast(this.$t("start.newDiagram.empty.title"), this.$t("start.newDiagram.empty.description"));
                return;
            }
            const graphUtils = this.$store.state.inventory.graphUtils;

            // Hide the modal
            this.dialogAddDiagram = false;

            // Create the diagram object
            const newDiagram = new ApiDiagram(diagramName);
            newDiagram.serialized = graphUtils.serializeToDiagram();

            // Call backend to create the diagram
            const response = await this.$store.dispatch("start/addDiagram", newDiagram);
            if (response.status === 201) {
                this.$store.commit("editor/setActiveDiagram", await response.json());
                await this.$router.push(routeNames.editor);
            }
        },
    },
});
</script>

<style lang="less" scoped>
.header {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

button {
    position: absolute;
    right: 16px;
}
</style>
