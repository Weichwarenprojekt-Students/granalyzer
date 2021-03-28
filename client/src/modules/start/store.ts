import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { Folder } from "@/modules/start/models/Folder";
import { Diagram } from "@/modules/start/models/Diagram";
import { DELETE, GET, POST, PUT } from "@/utility";

export class StartState {
    public folders = [] as Folder[];
    public diagrams = [] as Diagram[];
    public parent = new Folder();
    public loading = false;
}

export const start = {
    namespaced: true,
    state: new StartState(),
    mutations: {
        /**
         * De/Activate the loading state
         * @param state
         * @param loading
         */
        setLoadingState(state: StartState, loading: boolean): void {
            state.loading = loading;
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
         * Adds a diagram
         */
        addDiagram(state: StartState, diagram: Diagram): void {
            state.diagrams.push(diagram);
        },
        /**
         * Adds a folder
         */
        addFolder(state: StartState, folder: Folder): void {
            state.folders.push(folder);
        },
        /**
         * Move a diagram by id
         */
        moveDiagram(state: StartState, diagramId: number): void {
            state.diagrams = state.diagrams.filter((item) => item.id !== diagramId);
        },
        /**
         * Move a folder by id
         */
        moveFolder(state: StartState, folderId: number): void {
            state.folders = state.folders.filter((item) => item.id !== folderId);
        },
        /**
         * Deletes a diagram
         */
        deleteDiagram(state: StartState, diagram: Diagram): void {
            state.diagrams = state.diagrams.filter((item) => item.id != diagram.id);
        },
        /**
         * Deletes a folder
         */
        deleteFolder(state: StartState, folder: Folder): void {
            state.folders = state.folders.filter((item) => item.id != folder.id);
        },
        /**
         * Edits a diagram and updates the name
         */
        editDiagram(state: StartState, diagram: Diagram): void {
            state.diagrams = state.diagrams.map((item) => (item.id === diagram.id ? diagram : item));
        },
        /**
         * Edits a folder and updates the name
         */
        editFolder(state: StartState, folder: Folder): void {
            state.folders = state.folders.map((item) => (item.id === folder.id ? folder : item));
        },
        /**
         * Loads the folders for the current parent folder
         */
        loadFolders(state: StartState, folders: Folder[]): void {
            state.folders = folders;
        },
        /**
         * Loads the root diagrams into the diagram state
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
         * Adds a diagram to the tool-database
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
         * Adds a folder to the tool-database
         */
        async addFolder(
            context: ActionContext<StartState, RootState>,
            payload: { folder: Folder; folderId: number },
        ): Promise<void> {
            const path = payload.folderId ? "folders/" + payload.folderId + "/folders" : "folders";
            const res = await POST("/api/" + path, JSON.stringify(payload.folder));
            if (res.status === 201) {
                context.commit("addFolder", await res.json());
                context.commit("sortFolders");
            }
        },
        /**
         * Moves a diagram into a folder
         */
        async moveDiagram(
            context: ActionContext<StartState, RootState>,
            payload: { parentId: number; id: number },
        ): Promise<void> {
            const res =
                payload.parentId === undefined
                    ? await DELETE("/api/folders/" + context.getters.parent.id + "/diagrams/" + payload.id)
                    : await PUT(`/api/folders/${payload.parentId}/diagrams/${payload.id}`, "");

            if (res.status === 201) context.commit("moveDiagram", payload.id);
        },
        /**
         * Moves a folder into a folder
         */
        async moveFolder(
            context: ActionContext<StartState, RootState>,
            payload: { parentId: number; id: number },
        ): Promise<void> {
            const res =
                payload.parentId === undefined
                    ? await DELETE("/api/folders/" + context.state.parent.id + "/folders/" + payload.id)
                    : await PUT(`/api/folders/${payload.parentId}/folders/${payload.id}`, "");

            if (res.status === 201) context.commit("moveFolder", payload.id);
        },
        /**
         * Deletes a diagram
         */
        async deleteDiagram(context: ActionContext<StartState, RootState>, diagram: Diagram): Promise<void> {
            const res = await DELETE("/api/diagrams/" + diagram.id);
            if (res.status === 200) {
                context.commit("deleteDiagram", diagram);
                context.commit("sortDiagrams");
            }
        },
        /**
         * Deletes a folder
         */
        async deleteFolder(context: ActionContext<StartState, RootState>, folder: Folder): Promise<void> {
            const res = await DELETE("/api/folders/" + folder.id);
            if (res.status === 200) {
                context.commit("deleteFolder", folder);
                context.commit("sortFolders");
            }
        },
        /**
         * Change the name of a diagram
         */
        async editDiagram(context: ActionContext<StartState, RootState>, diagram: Diagram): Promise<void> {
            const res = await PUT("/api/diagrams/" + diagram.id, JSON.stringify(diagram));
            if (res.status === 200) {
                context.commit("editDiagram", diagram);
                context.commit("sortDiagrams");
            }
        },
        /**
         * Change the name of a folder
         */
        async editFolder(context: ActionContext<StartState, RootState>, folder: Folder): Promise<void> {
            const res = await PUT("/api/folders/" + folder.id, JSON.stringify(folder));
            if (res.status === 200) {
                context.commit("editFolder", folder);
                context.commit("sortFolders");
            }
        },
        /**
         * Loads the folders and items for the current folder
         */
        async loadItems(context: ActionContext<StartState, RootState>, routeId: number): Promise<void> {
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
