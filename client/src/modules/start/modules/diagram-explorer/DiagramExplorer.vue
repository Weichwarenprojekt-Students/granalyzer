<template>
    <div id="diagram-content">
        <InputDialog
            @input-confirm="addEmptyFolder"
            @cancel="addFolderDialog = false"
            :show="addFolderDialog"
            :image-src="require('@/assets/img/circle-plus.svg')"
            :title="$t('start.diagrams.addFolder')"
        ></InputDialog>
        <InputDialog
            @input-confirm="renameItem"
            @cancel="renameItemDialog = false"
            :show="renameItemDialog"
            :image-src="require('@/assets/img/editor-thin.svg')"
            :title="$t('start.diagrams.renameItem', { item: selectedItemName })"
        ></InputDialog>
        <ConfirmDialog
            @confirm="deleteItem"
            @cancel="deleteItemDialog = false"
            :show="deleteItemDialog"
            :title="$t('start.diagrams.deleteItem.title', { item: selectedItemName })"
            :description="$t('start.diagrams.deleteItem.description')"
        ></ConfirmDialog>
        <h2 id="title">{{ $t("start.diagrams.title") }}</h2>
        <img
            class="add-button"
            src="../../../../assets/img/add-folder.svg"
            alt="Add Folder"
            @click="addFolderDialog = true"
        />
        <img
            v-show="isItemSelected"
            class="add-button"
            src="../../../../assets/img/editor.svg"
            alt="Editor"
            @click="renameItemDialog = true"
        />
        <img
            v-show="isItemSelected"
            class="add-button"
            src="../../../../assets/img/trash.svg"
            alt="Delete"
            @click="deleteItemDialog = true"
        />
    </div>
    <div id="diagram-select">
        <!-- The back item-->
        <ExplorerItem
            v-show="$route.params.id !== ''"
            @dblclick="doubleClickedBack"
            :is-selected="false"
            title=".."
            :image-src="require('@/assets/img/folder-light.svg')"
            :is-folder="true"
            @dragover.prevent
        />
        <!-- The folders -->
        <ExplorerItem
            v-for="folder in folders"
            :key="folder.name"
            @mousedown="selectFolder(folder)"
            v-on:dblclick="doubleClickedFolder"
            :image-src="require('@/assets/img/folder.svg')"
            :title="folder.name"
            :is-selected="folder.id === selectedFolder.id"
            :is-folder="true"
            @dragover.prevent
            @drop.stop.prevent
        />
        <!-- The diagrams -->
        <ExplorerItem
            v-for="diagram in diagrams"
            :key="diagram.name"
            @mousedown="selectDiagram(diagram)"
            v-on:dblclick="doubleClickedDiagram"
            :image-src="require('@/assets/img/diagram.svg')"
            :title="diagram.name"
            :is-selected="diagram.id === selectedDiagram.id"
            :is-folder="false"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Folder } from "@/modules/start/models/Folder";
import { Diagram } from "@/modules/start/models/Diagram";
import { isEmpty } from "@/utility";
import InputDialog from "@/components/InputDialog.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import ExplorerItem from "./components/ExplorerItem.vue";

export default defineComponent({
    name: "DiagramExplorer",
    components: {
        ConfirmDialog,
        InputDialog,
        ExplorerItem,
    },
    data() {
        return {
            addFolderDialog: false,
            renameItemDialog: false,
            deleteItemDialog: false,
            selectedFolder: {} as Folder,
            selectedDiagram: {} as Diagram,
        };
    },
    /**
     * Load the folders
     */
    created() {
        this.updateFoldersAndDiagrams();
        window.addEventListener("keyup", this.onKeyUp);
    },
    unmounted() {
        window.removeEventListener("keyup", this.onKeyUp);
    },
    watch: {
        $route() {
            this.updateFoldersAndDiagrams();
        },
    },
    computed: {
        /**
         * @return True if any item is selected
         */
        isItemSelected(): boolean {
            return !isEmpty(this.selectedFolder) || !isEmpty(this.selectedDiagram);
        },
        /**
         * @return The name of the selected item
         */
        selectedItemName(): string {
            for (let i = 0; i < this.folders.length; i++)
                if (this.folders[i].id == this.selectedFolder.id) return this.folders[i].name;
            for (let i = 0; i < this.diagrams.length; i++)
                if (this.diagrams[i].id == this.selectedDiagram.id) return this.diagrams[i].name;
            return "";
        },
        /**
         * Fetches the names of the folders in the view
         *
         * @return Returns a string array containing the folder names
         */
        folders(): Folder[] {
            return this.$store.getters.folders;
        },
        /**
         * Fetches the names of the diagrams in the view
         *
         * @return Returns a string array containing the diagram names
         */
        diagrams(): Diagram[] {
            return this.$store.getters.diagrams;
        },
    },
    methods: {
        updateFoldersAndDiagrams(): void {
            this.$store.dispatch("loadFolders", this.$route.params.id);
            this.$store.dispatch("loadDiagrams", this.$route.params.id);
        },
        /**
         * Handle keyup events
         */
        onKeyUp(e: KeyboardEvent) {
            if (e.key !== "Delete") return;
            if (!isEmpty(this.selectedDiagram) || !isEmpty(this.selectedFolder)) this.deleteItemDialog = true;
        },
        /**
         * Add an empty folder
         *
         * @param folderName The name of the folder
         */
        addEmptyFolder(folderName: string): void {
            if (!folderName) {
                this.$toast.add({
                    severity: "error",
                    summary: this.$t("start.newFolder.empty.title"),
                    detail: this.$t("start.newFolder.empty.description"),
                    life: 3000,
                });
                return;
            }
            this.addFolderDialog = false;
            this.$store.dispatch("addFolder", { folder: new Folder(folderName), folderId: this.$route.params.id });
        },
        /**
         * Rename an item
         *
         * @param newName The new name of the item
         */
        renameItem(newName: string) {
            if (!isEmpty(this.selectedFolder)) {
                const copy = Folder.copy(this.selectedFolder);
                copy.name = newName;
                this.$store.dispatch("editFolder", copy);
            } else if (!isEmpty(this.selectedDiagram)) {
                const copy = Diagram.copy(this.selectedDiagram);
                copy.name = newName;
                this.$store.dispatch("editDiagram", copy);
            } else this.showSelectionError();
            this.renameItemDialog = false;
        },
        /**
         * Delete an item
         */
        deleteItem() {
            if (!isEmpty(this.selectedFolder)) {
                this.$store.dispatch("deleteFolder", this.selectedFolder);
            } else if (!isEmpty(this.selectedDiagram)) {
                this.$store.dispatch("deleteDiagram", this.selectedDiagram);
            } else this.showSelectionError();
            this.deleteItemDialog = false;
            this.selectedDiagram = {} as Diagram;
            this.selectedFolder = {} as Folder;
        },
        /**
         * Show a selection error
         */
        showSelectionError(): void {
            this.$toast.add({
                severity: "error",
                summary: this.$t("start.diagrams.noSelection.title"),
                detail: this.$t("start.diagrams.noSelection.description"),
                life: 3000,
            });
            this.selectedDiagram = {} as Diagram;
            this.selectedFolder = {} as Folder;
        },
        /**
         * Handle double click on folder
         */
        doubleClickedFolder(): void {
            this.$router.push("/start/" + this.selectedFolder.id);
        },
        /**
         * Handle double click on diagram
         */
        doubleClickedDiagram(): void {
            this.$store.dispatch("setDiagram", this.selectedDiagram);
            this.$router.push("/editor");
        },
        doubleClickedBack(): void {
            this.$router.back();
        },
        /**
         * Select a folder
         *
         * @param folder The folder that was selected
         */
        selectFolder(folder: Folder): void {
            this.selectedFolder = folder;
            this.selectedDiagram = {} as Diagram;
        },
        /**
         * Select a diagram
         *
         * @param diagram The diagram that was selected
         */
        selectDiagram(diagram: Diagram): void {
            this.selectedDiagram = diagram;
            this.selectedFolder = {} as Folder;
        },
    },
});
</script>

<style lang="less" scoped>
@import "../../../../styles/global";

#diagram-content {
    display: flex;
    margin-left: 16px;
}

#title {
    margin-right: 16px;
}

.add-button {
    cursor: pointer;
    margin-left: 16px;
    border-bottom: 2px solid transparent;
    padding: 0 2px 2px 2px;

    &:hover {
        border-bottom: 2px solid @secondary_color;
    }
}

#diagram-select {
    display: flex;
    flex-wrap: wrap;
}
</style>
