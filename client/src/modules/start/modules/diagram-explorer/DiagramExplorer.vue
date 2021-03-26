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
        <h2>{{ $t("start.diagrams.title") }}</h2>
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
        <div v-show="$route.params.id !== ''" class="diagram-item" @click="$router.go(-1)">
            <img class="diagram-item-image" src="../../../../assets/img/folder-light.svg" alt="Return" />
            <p class="diagram-item-text diagram-explorer-back">..</p>
        </div>

        <div
            :class="['diagram-item', { selected: selectedFolder.id === folder.id }]"
            v-for="folder in folders"
            :key="folder.name"
            draggable="true"
            @dragstart="startDrag($event, folder.name)"
            @dragenter="dragEnter($event, folder.name)"
            @dragleave.self="dragLeave($event, folder.name)"
            @drop="onDrop($event, folder.name)"
            @dragover.prevent
            @dragenter.prevent
            @click="selectFolder(folder)"
            v-on:dblclick="doubleClickedFolder"
            :ref="folder.name"
        >
            <img class="diagram-item-image" src="@/assets/img/folder.svg" alt="Folder" draggable="false" />
            <p class="diagram-item-text">{{ folder.name }}</p>
        </div>

        <div
            :class="['diagram-item', { selected: selectedDiagram.id === diagram.id }]"
            v-for="diagram in diagrams"
            :key="diagram.name"
            draggable="true"
            @dragstart="startDrag($event, diagram.name)"
            @dragend="endDrag($event, diagram.name)"
            @click="selectDiagram(diagram)"
            v-on:dblclick="doubleClickedDiagram"
            :ref="diagram.name"
        >
            <img class="diagram-item-image" src="@/assets/img/diagram.svg" alt="Folder" draggable="false" />
            <p class="diagram-item-text">{{ diagram.name }}</p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { Folder } from "@/modules/start/models/Folder";
import { Diagram } from "@/modules/start/models/Diagram";
import { isEmpty } from "@/utility";
import InputDialog from "@/components/InputDialog.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

export default defineComponent({
    name: "Diagram",
    components: {
        ConfirmDialog,
        InputDialog,
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
        this.$store.dispatch("loadFolders");
        this.$store.dispatch("loadDiagrams");
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
            console.log("teskljlk");
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
        /**
         * Add an empty folder
         *
         * @param folderName The name of the folder
         */
        addEmptyFolder(folderName: string): void {
            this.addFolderDialog = false;
            this.$store.dispatch("addFolder", new Folder(folderName));
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
            this.selectedFolder = {} as Folder;
            this.selectedDiagram = {} as Diagram;
        },
        /**
         * Handle double click on folder
         */
        doubleClickedFolder(): void {
            console.log("test");
        },
        /**
         * Handle double click on diagram
         */
        doubleClickedDiagram(): void {
            this.$store.dispatch("setDiagram", this.selectedDiagram);
            this.$router.push("/editor");
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
         * Event function to start dragging elements
         *
         * @param evt Type of MouseEvent
         * @param title Label of the div that is being dragged
         */
        // eslint-disable-next-line
        startDrag(evt: any, title: string): void {
            const dataTransfer = evt.dataTransfer;

            dataTransfer.dropEffect = "move";
            dataTransfer.effectAllowed = "move";

            // Store the ID of the element
            dataTransfer.setData("itemID", title);

            // Set styling for dragged element
            evt.currentTarget.classList.add("dragging");
        },
        /**
         * Event function when entering an element while dragging
         *
         * @param evt Type of MouseEvent
         * @param title Label of the div that is entered
         */
        // eslint-disable-next-line
        dragEnter(evt: any, title: string): void {
            // Set styling for the element that is hovered
            evt.currentTarget.classList.add("dragOver");
        },
        /**
         * Event function when leaving an element while dragging
         *
         * @param evt Type of MouseEvent
         * @param title Label of the div that is left
         */
        // eslint-disable-next-line
        dragLeave(evt: any, title: string): void {
            // Remove styling of the hovered element
            evt.currentTarget.classList.remove("dragOver");
        },
        /**
         * Event function when cancelling a drag operation
         *
         * @param evt Type of MouseEvent
         * @param title Label of the div that is dragged
         */
        // eslint-disable-next-line
        endDrag(evt: any, title: string): void {
            // Remove styling of the dragged element
            evt.currentTarget.classList.remove("dragging");
        },
        /**
         * Event function that handles the drop event
         *
         * @param evt Type of MouseEvent
         * @param title Label of the div that is dragged
         */
        // eslint-disable-next-line
        onDrop(evt: any, title: string): void {
            // Retrieve the ID of the dragged element
            const itemID = evt.dataTransfer.getData("itemID");

            // Reset styling of the element that an item is dropped on
            const element = evt.currentTarget;
            element.classList.remove("dragOver");
            element.classList.remove("dragging");

            if (itemID.toString() === title) {
                return;
            }
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

.add-button {
    cursor: pointer;
    margin-left: 16px;
    border-bottom: 2px solid transparent;
    padding: 0 2px 2px 2px;

    &:hover {
        border-bottom: 2px solid #ffa726;
    }
}

#diagram-select {
    display: flex;
    padding-top: 16px;
    flex-wrap: wrap;

    :hover {
        background: @accent_color;
    }

    .dragging {
        background: white;

        :hover {
            background: white;
        }
    }

    .selected {
        background: @secondary_color;
    }

    .dragOver {
        background: @accent_color;
    }

    .diagram-item {
        margin-right: 32px;
        cursor: pointer;
        padding: 16px;

        .diagram-explorer-back {
            color: @dark_grey;
        }

        .diagram-item-image {
            width: 100px;
            pointer-events: none;
        }

        .diagram-item-text {
            text-align: center;
            margin-top: 16px;
            max-width: 100px;
            pointer-events: none;
        }
    }
}
</style>
