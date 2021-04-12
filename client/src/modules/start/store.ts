import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { Folder } from "@/models/Folder";
import { Diagram } from "@/models/Diagram";
import { DELETE, GET, POST, PUT } from "@/utility";

export class StartState {
    /**
     * The currently opened folder (empty for root folder)
     */
    public parent = new Folder();
    /**
     * The child folders of the current parent
     */
    public folders = [] as Folder[];
    /**
     * The child diagrams of the current parent
     */
    public diagrams = [] as Diagram[];
    /**
     * True if the items are currently being loaded
     */
    public loading = false;
    /**
     * True if an item is currently dragged
     */
    public dragging = false;
}

export const start = {
    namespaced: true,
    state: new StartState(),
    mutations: {
        /**
         * (De-)activate the loading state
         */
        setLoadingState(state: StartState, loading: boolean): void {
            state.loading = loading;
        },
        /*+
         * (De-)activate the dragging state
         */
        setDraggingState(state: StartState, dragging: boolean): void {
            state.dragging = dragging;
        },
        /**
         * Sort the diagrams
         */
        sortDiagrams(state: StartState): void {
            state.diagrams.sort((first, second) => first.name.localeCompare(second.name));
        },
        /**
         * Sort the folders
         */
        sortFolders(state: StartState): void {
            state.folders.sort((first, second) => first.name.localeCompare(second.name));
        },
        /**
         * Add a diagram
         */
        addDiagram(state: StartState, diagram: Diagram): void {
            state.diagrams.push(diagram);
        },
        /**
         * Add a folder
         */
        addFolder(state: StartState, folder: Folder): void {
            state.folders.push(folder);
        },
        /**
         * Move a diagram
         */
        moveDiagram(state: StartState, diagramId: string): void {
            state.diagrams = state.diagrams.filter((item) => item.diagramId !== diagramId);
        },
        /**
         * Move a folder
         */
        moveFolder(state: StartState, folderId: string): void {
            state.folders = state.folders.filter((item) => item.folderId !== folderId);
        },
        /**
         * Delete a diagram
         */
        deleteDiagram(state: StartState, diagram: Diagram): void {
            state.diagrams = state.diagrams.filter((item) => item.diagramId != diagram.diagramId);
        },
        /**
         * Delete a folder
         */
        deleteFolder(state: StartState, folder: Folder): void {
            state.folders = state.folders.filter((item) => item.folderId != folder.folderId);
        },
        /**
         * Edit a diagram and updates the name
         */
        editDiagram(state: StartState, diagram: Diagram): void {
            state.diagrams = state.diagrams.map((item) => (item.diagramId === diagram.diagramId ? diagram : item));
        },
        /**
         * Edit a folder and updates the name
         */
        editFolder(state: StartState, folder: Folder): void {
            state.folders = state.folders.map((item) => (item.folderId === folder.folderId ? folder : item));
        },
        /**
         * Load the folders for the current parent folder
         */
        loadFolders(state: StartState, folders: Folder[]): void {
            state.folders = folders;
        },
        /**
         * Load the root diagrams into the diagram state
         */
        loadDiagrams(state: StartState, diagrams: Diagram[]): void {
            state.diagrams = diagrams;
        },
        /**
         * Load the parent folder
         */
        loadParent(state: StartState, parent: Folder): void {
            state.parent = parent;
        },
    },
    actions: {
        /**
         * Add a diagram to the tool-database
         */
        async addDiagram(context: ActionContext<StartState, RootState>, diagram: Diagram): Promise<Response> {
            const res = await POST("/api/diagrams", JSON.stringify(diagram));
            const ret = res.clone();
            if (res.status === 201) {
                context.commit("addDiagram", await res.json());
                context.commit("sortDiagrams");
            }
            return ret;
        },
        /**
         * Add a folder to the tool-database
         */
        async addFolder(
            context: ActionContext<StartState, RootState>,
            payload: { folder: Folder; folderId: string },
        ): Promise<void> {
            const path = payload.folderId ? `folders/${payload.folderId}/folders` : "folders";
            const res = await POST(`/api/${path}`, JSON.stringify(payload.folder));
            if (res.status === 201) {
                context.commit("addFolder", await res.json());
                context.commit("sortFolders");
            }
        },
        /**
         * Move a diagram into a folder
         */
        async moveDiagram(
            context: ActionContext<StartState, RootState>,
            payload: { parentId: string; id: string },
        ): Promise<void> {
            const res =
                payload.parentId === null
                    ? await DELETE(`/api/folders/${context.state.parent.folderId}/diagrams/${payload.id}`)
                    : await PUT(`/api/folders/${payload.parentId}/diagrams/${payload.id}`, "");

            if (res.status === 200) context.commit("moveDiagram", payload.id);
        },
        /**
         * Move a folder into a folder
         */
        async moveFolder(
            context: ActionContext<StartState, RootState>,
            payload: { parentId: string; id: string },
        ): Promise<void> {
            const res =
                payload.parentId === null
                    ? await DELETE(`/api/folders/${context.state.parent.folderId}/folders/${payload.id}`)
                    : await PUT(`/api/folders/${payload.parentId}/folders/${payload.id}`, "");

            if (res.status === 200) context.commit("moveFolder", payload.id);
        },
        /**
         * Delete a diagram
         */
        async deleteDiagram(context: ActionContext<StartState, RootState>, diagram: Diagram): Promise<void> {
            const res = await DELETE(`/api/diagrams/${diagram.diagramId}`);
            if (res.status === 200) {
                context.commit("deleteDiagram", diagram);
                context.commit("sortDiagrams");
            }
        },
        /**
         * Delete a folder
         */
        async deleteFolder(context: ActionContext<StartState, RootState>, folder: Folder): Promise<void> {
            const res = await DELETE(`/api/folders/${folder.folderId}`);
            if (res.status === 200) {
                context.commit("deleteFolder", folder);
                context.commit("sortFolders");
            }
        },
        /**
         * Change the name of a diagram
         */
        async editDiagram(context: ActionContext<StartState, RootState>, diagram: Diagram): Promise<void> {
            console.log(diagram);
            const res = await PUT(`/api/diagrams/${diagram.diagramId}`, JSON.stringify(diagram));
            if (res.status === 200) {
                context.commit("editDiagram", await res.json());
                context.commit("sortDiagrams");
            }
        },
        /**
         * Change the name of a folder
         */
        async editFolder(context: ActionContext<StartState, RootState>, folder: Folder): Promise<void> {
            const res = await PUT(`/api/folders/${folder.folderId}`, JSON.stringify(folder));
            if (res.status === 200) {
                context.commit("editFolder", await res.json());
                context.commit("sortFolders");
            }
        },
        /**
         * Load the folders and items for the current folder
         */
        async loadItems(context: ActionContext<StartState, RootState>, routeId: string): Promise<void> {
            // Load the items
            context.commit("setLoadingState", true);
            const resDiagrams = await GET(routeId ? `/api/folders/${routeId}/diagrams` : "/api/diagrams/root");
            const resFolders = await GET(routeId ? `/api/folders/${routeId}/folders` : "/api/folders/root");
            if (resDiagrams.status === 200 && resFolders.status === 200) {
                context.commit("loadDiagrams", await resDiagrams.json());
                context.commit("sortDiagrams");

                context.commit("loadFolders", await resFolders.json());
                context.commit("sortFolders");
            }

            // Load the parent
            const resParent = await GET(`/api/folders/${routeId}`);
            context.commit("loadParent", resParent.status === 200 ? await resParent.json() : new Folder());
            context.commit("setLoadingState", false);
        },
    },
};
