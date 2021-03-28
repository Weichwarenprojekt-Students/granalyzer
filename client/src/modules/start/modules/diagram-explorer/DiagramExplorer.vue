<template>
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
    <div id="explorer-header">
        <h2 id="title">{{ $t("start.diagrams.title") }}</h2>
        <h2 v-show="$store.state.start.parent.name" id="title-minus">&#8212;</h2>
        <h2 v-show="$store.state.start.parent.name" id="title-folder">{{ $store.state.start.parent.name }}</h2>
        <img
            id="add-folder"
            class="explorer-button"
            src="../../../../assets/img/add-folder.svg"
            alt="Add Folder"
            @click="addFolderDialog = true"
        />
        <img
            v-show="isItemSelected"
            class="explorer-button"
            src="../../../../assets/img/editor.svg"
            alt="Editor"
            @click="renameItemDialog = true"
        />
        <img
            v-show="isItemSelected"
            class="explorer-button"
            src="../../../../assets/img/trash.svg"
            alt="Delete"
            @click="deleteItemDialog = true"
        />
    </div>
    <ProgressBar mode="indeterminate" id="loading" v-show="$store.state.start.loading" />
    <div v-show="!$store.state.start.loading" id="explorer-content">
        <!-- The back item-->
        <ExplorerItem
            v-show="$route.params.id !== ''"
            @dblclick="doubleClickedBack"
            :is-selected="false"
            title=".."
            :image-src="require('@/assets/img/folder-light.svg')"
            :is-folder="true"
            :itemId="$store.state.start.parent.parentId"
            draggable="false"
            @dragover.prevent
            @folder-drop="moveFolder"
            @diagram-drop="moveDiagram"
        />
        <!-- The folders -->
        <ExplorerItem
            v-for="folder in $store.state.start.folders"
            :key="folder.id"
            @mousedown="selectFolder(folder)"
            v-on:dblclick="doubleClickedFolder"
            :image-src="require('@/assets/img/folder.svg')"
            :title="folder.name"
            :is-selected="folder.id === selectedFolder.id"
            :is-folder="true"
            :itemId="folder.id"
            @dragover.prevent
            @drop.stop.prevent
            @folder-drop="moveFolder"
            @diagram-drop="moveDiagram"
        />
        <!-- The diagrams -->
        <ExplorerItem
            v-for="diagram in $store.state.start.diagrams"
            :key="diagram.id"
            @mousedown="selectDiagram(diagram)"
            v-on:dblclick="doubleClickedDiagram"
            :image-src="require('@/assets/img/diagram.svg')"
            :title="diagram.name"
            :is-selected="diagram.id === selectedDiagram.id"
            :is-folder="false"
            :itemId="diagram.id"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Folder } from "@/modules/start/models/Folder";
import { Diagram } from "@/modules/start/models/Diagram";
import { isEmpty, routeNames } from "@/utility";
import InputDialog from "@/components/InputDialog.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import ExplorerItem from "./components/ExplorerItem.vue";
import { ItemDragEvent } from "@/modules/start/modules/diagram-explorer/models/ItemDragEvent";

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
        this.loadItems();
        window.addEventListener("keyup", this.onKeyUp);
    },
    unmounted() {
        window.removeEventListener("keyup", this.onKeyUp);
    },
    watch: {
        $route(to) {
            if (to.path.startsWith(routeNames.start)) this.loadItems();
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
            const folders = this.$store.state.start.folders;
            const diagrams = this.$store.state.start.diagrams;
            for (let i = 0; i < folders.length; i++)
                if (folders[i].id == this.selectedFolder.id) return folders[i].name;
            for (let i = 0; i < diagrams.length; i++)
                if (diagrams[i].id == this.selectedDiagram.id) return diagrams[i].name;
            return "";
        },
    },
    methods: {
        /**
         * Update the folders and diagrams based on the route
         */
        loadItems(): void {
            this.$store.dispatch("start/loadItems", this.$route.params.id);
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
            this.$store.dispatch("start/addFolder", {
                folder: new Folder(folderName),
                folderId: this.$route.params.id,
            });
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
                this.$store.dispatch("start/editFolder", copy);
            } else if (!isEmpty(this.selectedDiagram)) {
                const copy = Diagram.copy(this.selectedDiagram);
                copy.name = newName;
                this.$store.dispatch("start/editDiagram", copy);
            } else this.showSelectionError();
            this.renameItemDialog = false;
        },
        /**
         * Delete an item
         */
        async deleteItem() {
            if (!isEmpty(this.selectedFolder)) {
                await this.$store.dispatch("start/deleteFolder", this.selectedFolder);
                this.loadItems();
            } else if (!isEmpty(this.selectedDiagram)) {
                this.$store.dispatch("start/deleteDiagram", this.selectedDiagram);
            } else this.showSelectionError();

            this.deleteItemDialog = false;
            this.clearSelection();
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
            this.clearSelection();
        },
        /**
         * Handle double click on folder
         */
        doubleClickedFolder(): void {
            this.$router.push(`${routeNames.start}/${this.selectedFolder.id}`);
            this.clearSelection();
        },
        /**
         * Handle double click on diagram
         */
        doubleClickedDiagram(): void {
            this.$store.dispatch("editor/setDiagram", this.selectedDiagram);
            this.$router.push(routeNames.editor);
        },
        /**
         * Handle a click on the ".." folder
         */
        doubleClickedBack(): void {
            const parentId = this.$store.state.start.parent.parentId;
            this.$router.push(parentId === undefined ? routeNames.start : `${routeNames.start}/${parentId}`);
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
        /**
         * Move a folder
         */
        moveFolder(event: ItemDragEvent): void {
            this.$store.dispatch("start/moveFolder", { parentId: event.newParent, id: event.currentDragItem });
            this.clearSelection();
        },
        /**
         * Move a diagram
         */
        moveDiagram(event: ItemDragEvent): void {
            this.$store.dispatch("start/moveDiagram", { parentId: event.newParent, id: event.currentDragItem });
            this.clearSelection();
        },
        /**
         * Clear the active selection
         */
        clearSelection(): void {
            this.selectedDiagram = {} as Diagram;
            this.selectedFolder = {} as Folder;
        },
    },
});
</script>

<style lang="less" scoped>
@import "../../../../styles/global";

#loading {
    margin: 16px 64px;
    overflow: hidden;
}

#add-folder {
    margin-left: 32px;
}

#title-minus {
    margin: 0 12px;
}

#title-folder {
    font-style: italic;
}

.explorer-button {
    cursor: pointer;
    margin-left: 16px;
    border-bottom: 2px solid transparent;
    padding: 0 2px 2px 2px;

    &:hover {
        border-bottom: 2px solid @primary_color;
    }
}

#explorer-header {
    display: flex;
    margin-left: 64px;
}

#explorer-content {
    display: flex;
    flex-wrap: wrap;
    padding: 0 48px;
}
</style>
