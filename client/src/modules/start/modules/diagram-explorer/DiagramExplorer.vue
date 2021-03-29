<template>
    <!-- The dialog for adding a folder -->
    <InputDialog
        @input-confirm="addEmptyFolder"
        @cancel="addFolderDialog = false"
        :show="addFolderDialog"
        :image-src="`${require('@/assets/img/icons.svg')}#circle-plus`"
        :title="$t('start.diagrams.addFolder')"
    ></InputDialog>

    <!-- The dialog for renaming a folder -->
    <InputDialog
        @input-confirm="renameItem"
        @cancel="renameItemDialog = false"
        :show="renameItemDialog"
        :image-src="require('@/assets/img/icons.svg') + '#editor-thin'"
        :title="$t('start.diagrams.renameItem', { item: selectedItemName })"
    ></InputDialog>

    <!-- The dialog for adding a folder -->
    <ConfirmDialog
        @confirm="deleteItem"
        @cancel="deleteItemDialog = false"
        :show="deleteItemDialog"
        :title="$t('start.diagrams.deleteItem.title', { item: selectedItemName })"
        :description="$t('start.diagrams.deleteItem.description')"
    ></ConfirmDialog>

    <!-- The explorer toolbar -->
    <div class="explorer-header">
        <h2 class="title">{{ $t("start.diagrams.title") }}</h2>
        <h2 v-show="$store.state.start.parent.name" class="title-minus">&#8212;</h2>
        <h2 v-show="$store.state.start.parent.name" class="title-folder">{{ $store.state.start.parent.name }}</h2>
        <svg class="add-folder explorer-button" @click="addFolderDialog = true">
            <use xlink:href="~@/assets/img/icons.svg#add-folder"></use>
        </svg>
        <svg v-show="isItemSelected" class="explorer-button" @click="renameItemDialog = true">
            <use :xlink:href="`${require('@/assets/img/icons.svg')}#editor`"></use>
        </svg>
        <svg v-show="isItemSelected" class="explorer-button" @click="deleteItemDialog = true">
            <use :xlink:href="`${require('@/assets/img/icons.svg')}#trash`"></use>
        </svg>
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
            :icon-id="'folder-light'"
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
            :icon-id="'folder'"
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
            :icon-id="'diagram'"
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
            // True if the add folder dialog should be shown
            addFolderDialog: false,
            // True if the rename dialog should be shown
            renameItemDialog: false,
            // True if the delete dialog should be shown
            deleteItemDialog: false,
            // The selected folder (empty if no folder is selected)
            selectedFolder: {} as Folder,
            // The selected diagram (empty if no diagram is selected)
            selectedDiagram: {} as Diagram,
        };
    },
    created() {
        // Load the items
        this.loadItems();
        // Handle shortcuts
        window.addEventListener("keyup", this.onKeyUp);
    },
    unmounted() {
        window.removeEventListener("keyup", this.onKeyUp);
    },
    watch: {
        $route(to) {
            // Check if the items have to be reloaded
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
                const copy = this.selectedFolder.copy();
                copy.name = newName;
                this.$store.dispatch("start/editFolder", copy);
            } else if (!isEmpty(this.selectedDiagram)) {
                const copy = this.selectedDiagram.copy();
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
@import "~@/styles/global";

.loading {
    margin: 16px 64px;
    overflow: hidden;
}

.add-folder {
    margin-left: 32px;
}

.title-minus {
    margin: 0 12px;
}

.title-folder {
    font-style: italic;
}

.explorer-button {
    cursor: pointer;
    margin-left: 16px;
    border-bottom: 2px solid transparent;
    padding: 0 2px 2px 2px;
    height: 24px;
    width: 24px;
    fill: #333;

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