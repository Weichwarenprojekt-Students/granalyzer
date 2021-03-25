<template>
    <div id="diagram-content">
        <h2>{{ $t("start.diagrams.title") }}</h2>
        <img
            class="add-button"
            src="../../../../assets/img/add-folder.svg"
            alt="Add Folder"
            @click="folderAddEmpty = true"
        />
        <img
            v-show="selectedItem != null"
            class="add-button"
            src="../../../../assets/img/editor.svg"
            alt="Editor"
            @click="folderAddEmpty = true"
        />
        <img
            v-show="selectedItem != null"
            class="add-button"
            src="../../../../assets/img/trash.svg"
            alt="Delete"
            @click="folderAddEmpty = true"
        />
    </div>
    <InputDialog
        @input-confirm="addEmptyFolder"
        @cancel="folderAddEmpty = false"
        :show="folderAddEmpty"
        title="Add Folder"
    ></InputDialog>
    <div id="diagram-select">
        <div class="diagram-item">
            <img class="diagram-item-image" src="../../../../assets/img/folder-light.svg" alt="Return" />
            <p class="diagram-item-text diagram-explorer-back">..</p>
        </div>

        <div
            class="diagram-item"
            v-for="folder in fetchFolders()"
            :key="folder.name"
            draggable="true"
            @dragstart="startDrag($event, folder.name)"
            @dragenter="dragEnter($event, folder.name)"
            @dragleave.self="dragLeave($event, folder.name)"
            @drop="onDrop($event, folder.name)"
            @dragover.prevent
            @dragenter.prevent
            :ref="folder.name"
        >
            <img class="diagram-item-image" src="@/assets/img/folder.svg" alt="Folder" draggable="false" />
            <p class="diagram-item-text">{{ folder.name }}</p>
        </div>

        <div
            class="diagram-item"
            v-for="diagram in fetchDiagrams()"
            :key="diagram.name"
            draggable="true"
            @dragstart="startDrag($event, diagram.name)"
            @dragend="endDrag($event, diagram.name)"
            @click="onClick($event, diagram.name)"
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
import InputDialog from "@/components/InputDialog.vue";

export default defineComponent({
    name: "Diagram",
    components: {
        InputDialog,
    },
    data() {
        return {
            folderAddEmpty: false,
            selectedItem: null,
        };
    },
    created() {
        this.$store.dispatch("loadFolders");
        this.$store.dispatch("loadDiagrams");
        //const route = useRoute();
        //console.log(route.params.id);
    },
    methods: {
        /**
         * Add an empty folder
         *
         * @param folderName The name of the folder
         */
        addEmptyFolder(folderName: string): void {
            this.$toast.add({
                severity: "success",
                summary: "Added Folder",
                detail: "Added an empty folder!",
                life: 3000,
            });
            this.folderAddEmpty = false;
            this.$store.dispatch("addFolder", new Folder(folderName));
        },
        /**
         * Fetches the names of the folders in the view
         *
         * @return Returns a string array containing the folder names
         */
        fetchFolders(): Folder[] {
            return this.$store.getters.getFolders;
        },
        /**
         * Fetches the names of the diagrams in the view
         *
         * @return Returns a string array containing the diagram names
         */
        fetchDiagrams(): string[] {
            return this.$store.getters.getDiagrams;
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
        /**
         * Event function that handles the click on a folder
         *
         * @param evt
         * @param title
         */
        // eslint-disable-next-line
        onClick(evt: any, title: string): void {
            console.log("click detected");
            console.log(evt);
            console.log(title);
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
