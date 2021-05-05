<template>
    <!-- The dialog for adding a folder -->
    <InputDialog
        @input-confirm="addEmptyFolder"
        @cancel="addFolderDialog = false"
        :show="addFolderDialog"
        :image-src="`${require('@/assets/img/icons.svg')}#circle-plus`"
        :title="$t('start.diagrams.addFolder')"
    ></InputDialog>

    <!-- The dialog for renaming an item -->
    <InputDialog
        @input-confirm="renameItem"
        @cancel="renameItemDialog = false"
        :show="renameItemDialog"
        :image-src="`${require(`@/assets/img/icons.svg`)}#editor-thin`"
        :title="$t('start.diagrams.renameItem', { item: selectedItemName })"
    ></InputDialog>

    <!-- The dialog for copying a diagram -->
    <InputDialog
        @input-confirm="copyDiagram"
        @cancel="diagramCopyDialog = false"
        :show="diagramCopyDialog"
        :image-src="`${require(`@/assets/img/icons.svg`)}#circle-plus`"
        :title="$t('start.diagrams.copyItem', { item: selectedItemName })"
    ></InputDialog>

    <!-- The dialog for deleting a diagram -->
    <ConfirmDialog
        @confirm="deleteItem('diagram')"
        @cancel="deleteDiagramDialog = false"
        :show="deleteDiagramDialog"
        :title="$t('start.diagrams.deletion.title', { item: selectedItemName })"
        :description="$t('start.diagrams.deletion.deleteItem.description')"
    ></ConfirmDialog>

    <!-- The dialog for deleting a non-empty folder -->
    <ConfirmDialog
        @confirm="deleteItem('folder')"
        @cancel="deleteFolderDialog = false"
        :show="deleteFolderDialog"
        :title="$t('start.diagrams.deletion.title', { item: selectedItemName })"
        :description="$t('start.diagrams.deletion.deleteFolder.description', { num: nItemsInFolder })"
    ></ConfirmDialog>

    <!-- The explorer toolbar -->
    <div class="explorer-header">
        <h2 class="title">{{ $t("start.diagrams.title") }}</h2>
        <h2 v-show="$store.state.start.parent.name" class="title-extra">&#8212;</h2>
        <h2 v-show="$store.state.start.parent.name" class="title-extra">{{ $store.state.start.parent.name }}</h2>

        <!-- Add Folder -->
        <div class="tooltip" v-tooltip.bottom="$t('start.tooltip.newFolder')" @click="addFolderDialog = true">
            <svg class="explorer-button">
                <use xlink:href="~@/assets/img/icons.svg#add-folder"></use>
            </svg>
        </div>

        <!-- Copy Diagram -->
        <div
            v-show="Object.keys(selectedDiagram).length > 0"
            class="tooltip"
            v-tooltip.bottom="$t('start.tooltip.copy')"
            @click="diagramCopyDialog = true"
        >
            <svg class="explorer-button">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#copy`"></use>
            </svg>
        </div>

        <!-- Edit Item -->
        <div
            v-show="isItemSelected"
            class="tooltip"
            v-tooltip.bottom="$t('start.tooltip.rename')"
            @click="renameItemDialog = true"
        >
            <svg class="explorer-button">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#editor`"></use>
            </svg>
        </div>

        <!-- Delete Item -->
        <div
            v-show="isItemSelected"
            class="tooltip"
            v-tooltip.bottom="$t('start.tooltip.delete')"
            @click="deleteDialog"
        >
            <svg class="explorer-button">
                <use :xlink:href="`${require('@/assets/img/icons.svg')}#trash`"></use>
            </svg>
        </div>
    </div>

    <!-- The explorer content -->
    <ProgressBar mode="indeterminate" class="loading" v-show="$store.state.start.loading" />
    <div v-show="!$store.state.start.loading" class="explorer-content">
        <!-- The ".." folder -->
        <ExplorerItem
            v-show="$route.params.id !== ''"
            @dblclick="doubleClickedBack"
            :is-selected="false"
            title=".."
            icon-id="folder-grey"
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
            :key="folder.folderId"
            @mousedown="selectFolder(folder)"
            v-on:dblclick="doubleClickedFolder"
            icon-id="folder"
            :title="folder.name"
            :is-selected="folder.folderId === selectedFolder.folderId"
            :is-folder="true"
            :itemId="folder.folderId"
            @dragover.prevent
            @drop.stop.prevent
            @folder-drop="moveFolder"
            @diagram-drop="moveDiagram"
        />

        <!-- The diagrams -->
        <ExplorerItem
            v-for="diagram in $store.state.start.diagrams"
            :key="diagram.diagramId"
            @mousedown="selectDiagram(diagram)"
            v-on:dblclick="doubleClickedDiagram"
            icon-id="diagram"
            :title="diagram.name"
            :is-selected="diagram.diagramId === selectedDiagram.diagramId"
            :is-folder="false"
            :itemId="diagram.diagramId"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ApiFolder } from "@/models/ApiFolder";
import { ApiDiagram } from "@/models/ApiDiagram";
import { deepCopy, errorToast, isEmpty, routeNames } from "@/utility";
import InputDialog from "@/components/dialog/InputDialog.vue";
import ConfirmDialog from "@/components/dialog/ConfirmDialog.vue";
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
            // True if the add folder dialog should be shown
            addFolderDialog: false,
            // True if the rename dialog should be visible
            renameItemDialog: false,
            // True if the delete dialog should be visible
            deleteDiagramDialog: false,
            // True if a folder is deleted
            deleteFolderDialog: false,
            // Amount of items in a folder for deletion warning
            nItemsInFolder: 0,
            // True, if the copying dialog should be visible
            diagramCopyDialog: false,
            // The selected folder (empty if no folder is selected)
            selectedFolder: {} as ApiFolder,
            // The selected diagram (empty if no diagram is selected)
            selectedDiagram: {} as ApiDiagram,
        };
    },
    created() {
        // Load the items
        this.loadItems();
        // Handle shortcuts
        window.addEventListener("keydown", this.onKeyDown);
    },
    unmounted() {
        window.removeEventListener("keydown", this.onKeyDown);
    },
    watch: {
        /**
         * Check if items have to be reloaded
         */
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

            // Search for the name (name has to be searched because the name
            // of the selected folder can be outdated due to a rename event)
            for (let i = 0; i < folders.length; i++)
                if (folders[i].folderId === this.selectedFolder.folderId) return folders[i].name;
            for (let i = 0; i < diagrams.length; i++)
                if (diagrams[i].diagramId === this.selectedDiagram.diagramId) return diagrams[i].name;
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
        onKeyDown(e: KeyboardEvent): void {
            if (e.key == "Delete" && (!isEmpty(this.selectedDiagram) || !isEmpty(this.selectedFolder)))
                this.deleteDialog();
            else if (e.key == "d" && e.ctrlKey && !isEmpty(this.selectedDiagram)) {
                e.preventDefault();
                this.diagramCopyDialog = true;
            }
        },
        /**
         * Add an empty folder
         *
         * @param folderName The name of the folder
         */
        addEmptyFolder(folderName: string): void {
            if (!folderName) {
                errorToast(this.$t("start.newFolder.empty.title"), this.$t("start.newFolder.empty.description"));
                return;
            }

            this.addFolderDialog = false;
            this.$store.dispatch("start/addFolder", {
                folder: new ApiFolder(folderName),
                folderId: this.$route.params.id,
            });
        },
        /**
         * Rename an item
         *
         * @param newName The new name of the item
         */
        renameItem(newName: string): void {
            if (!newName) {
                errorToast(this.$t("start.newFolder.empty.title"), this.$t("start.newFolder.empty.description"));
                return;
            }

            if (!isEmpty(this.selectedFolder)) {
                const copy = deepCopy(this.selectedFolder);
                copy.name = newName;
                this.$store.dispatch("start/editFolder", copy);
            } else if (!isEmpty(this.selectedDiagram)) {
                const copy = deepCopy(this.selectedDiagram);
                copy.name = newName;
                this.$store.dispatch("start/editDiagram", copy);
            } else this.showSelectionError();
            this.renameItemDialog = false;
        },
        /**
         * Activate the correct dialog for folder/ diagram deletion or delete empty folders without dialog
         */
        async deleteDialog(): Promise<void> {
            if (!isEmpty(this.selectedFolder)) {
                this.nItemsInFolder = await this.$store.dispatch("start/checkFolder", this.selectedFolder.folderId);
                if (this.nItemsInFolder === 0) this.deleteItem("folder");
                else this.deleteFolderDialog = true;
            } else if (!isEmpty(this.selectedDiagram)) {
                this.deleteDiagramDialog = true;
            } else this.showSelectionError();
        },
        /**
         * Delete a folder or diagram
         */
        deleteItem(deletionType: string): void {
            switch (deletionType) {
                case "folder":
                    this.$store.dispatch("start/deleteFolder", this.selectedFolder);
                    this.clearSelection();
                    this.deleteFolderDialog = false;
                    break;
                case "diagram":
                    this.$store.dispatch("start/deleteDiagram", this.selectedDiagram);
                    this.clearSelection();
                    this.deleteDiagramDialog = false;
                    break;
            }
        },
        /**
         * Makes a copy of a diagram
         */
        copyDiagram(newName: string) {
            if (!newName) {
                errorToast(
                    this.$t("start.diagrams.noCopyTitle.title"),
                    this.$t("start.diagrams.noCopyTitle.description"),
                );
                return;
            }

            this.diagramCopyDialog = false;
            const newDiagram = new ApiDiagram(newName);
            newDiagram.serialized = this.selectedDiagram.serialized;
            this.$store.dispatch("start/addDiagram", newDiagram);
        },
        /**
         * Show a selection error
         */
        showSelectionError(): void {
            errorToast(this.$t("start.diagrams.noSelection.title"), this.$t("start.diagrams.noSelection.description"));
            this.clearSelection();
        },
        /**
         * Handle double click on folder
         */
        doubleClickedFolder(): void {
            this.$router.push(`${routeNames.start}/${this.selectedFolder.folderId}`);
            this.clearSelection();
        },
        /**
         * Handle double click on diagram
         */
        doubleClickedDiagram(): void {
            this.$store.commit("editor/setActiveDiagram", this.selectedDiagram);
            this.$router.push(routeNames.editor);
        },
        /**
         * Handle a click on the ".." folder
         */
        doubleClickedBack(): void {
            const parentId = this.$store.state.start.parent.parentId;
            this.$router.push(parentId === null ? routeNames.start : `${routeNames.start}/${parentId}`);
        },
        /**
         * Select a folder
         *
         * @param folder The folder that was selected
         */
        selectFolder(folder: ApiFolder): void {
            this.selectedFolder = folder;
            this.selectedDiagram = {} as ApiDiagram;
        },
        /**
         * Select a diagram
         *
         * @param diagram The diagram that was selected
         */
        selectDiagram(diagram: ApiDiagram): void {
            this.selectedDiagram = diagram;
            this.selectedFolder = {} as ApiFolder;
        },
        /**
         * Move a folder
         */
        moveFolder(event: ItemDragEvent): void {
            this.$store.dispatch("start/moveFolder", { parentId: event.newParent, folderId: event.currentDragItem });
            this.clearSelection();
        },
        /**
         * Move a diagram
         */
        moveDiagram(event: ItemDragEvent): void {
            this.$store.dispatch("start/moveDiagram", { parentId: event.newParent, diagramId: event.currentDragItem });
            this.clearSelection();
        },
        /**
         * Clear the active selection
         */
        clearSelection(): void {
            this.selectedDiagram = {} as ApiDiagram;
            this.selectedFolder = {} as ApiFolder;
        },
    },
});
</script>

<style lang="less" scoped>
@import "~@/styles/global";

.loading {
    margin: 16px 64px;
    overflow: hidden;
}

.add-folder {
    margin-left: 32px;
}

.title-extra {
    margin-left: 12px;
    font-style: italic;
}

.tooltip {
    margin-left: 16px;
    height: 28px;
    width: 28px;
}

.explorer-button {
    cursor: pointer;
    border-bottom: 2px solid transparent;
    padding: 0 2px 2px 2px;
    height: inherit;
    width: inherit;
    fill: @dark;

    &:hover {
        border-bottom: 2px solid @primary_color;
    }
}

.explorer-header {
    display: flex;
    margin-left: 64px;
}

.explorer-content {
    display: flex;
    flex-wrap: wrap;
    padding: 0 48px 64px 48px;
}
</style>
