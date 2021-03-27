import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { Folder } from "@/modules/start/models/Folder";
import { Diagram } from "@/modules/start/models/Diagram";
import { DELETE, GET, POST, PUT } from "@/utility";

export class StartState {
    public folders = [] as Folder[];
    public diagrams = [] as Diagram[];
}

export const start = {
    state: new StartState(),
    mutations: {
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
         *
         * @param state Storage state
         * @param diagram Diagram to be put into the database
         */
        addDiagram(state: StartState, diagram: Diagram): void {
            state.diagrams.push(diagram);
        },
        /**
         * Adds a folder
         *
         * @param state Storage state
         * @param folder Folder to be put into the database
         */
        addFolder(state: StartState, folder: Folder): void {
            state.folders.push(folder);
        },
        /**
         * Deletes a diagram
         *
         * @param state Storage state
         * @param diagram Diagram to be deleted
         */
        deleteDiagram(state: StartState, diagram: Diagram): void {
            state.diagrams = state.diagrams.filter((item) => item.id !== diagram.id);
        },
        /**
         * Deletes a folder
         *
         * @param state Storage state
         * @param folder Folder to be deleted
         */
        deleteFolder(state: StartState, folder: Folder): void {
            state.folders = state.folders.filter((item) => item.id !== folder.id);
        },
        /**
         * Edits a diagram and updates the name
         *
         * @param state Storage state
         * @param diagram Folder to be updated
         */
        editDiagram(state: StartState, diagram: Diagram): void {
            state.diagrams = state.diagrams.map((item) => (item.id === diagram.id ? diagram : item));
        },
        /**
         * Edits a folder and updates the name
         *
         * @param state Storage state
         * @param folder Folder to be updated
         */
        editFolder(state: StartState, folder: Folder): void {
            state.folders = state.folders.map((item) => (item.id === folder.id ? folder : item));
        },
        /**
         * Loads the root folders into the folder state
         *
         * @param state Storage state
         * @param folders The loaded folders
         */
        loadFolders(state: StartState, folders: Folder[]): void {
            state.folders = folders;
        },
        /**
         * Loads the root diagrams into the diagram state
         *
         * @param state Storage state
         * @param diagrams The loaded diagrams
         */
        loadDiagrams(state: StartState, diagrams: Diagram[]): void {
            state.diagrams = diagrams;
        },
    },
    actions: {
        /**
         * Adds a diagram to the tool-database
         *
         * @param context -
         * @param diagram Diagram to be added
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
         *
         * @param context -
         * @param payload
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
         * Deletes a diagram
         *
         * @param context -
         * @param diagram Diagram to be deleted
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
         *
         * @param context -
         * @param folder Folder to be deleted
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
         *
         * @param context -
         * @param diagram New diagram values
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
         *
         * @param context -
         * @param folder New folder values
         */
        async editFolder(context: ActionContext<StartState, RootState>, folder: Folder): Promise<void> {
            const res = await PUT("/api/folders/" + folder.id, JSON.stringify(folder));
            if (res.status === 200) {
                context.commit("editFolder", folder);
                context.commit("sortFolders");
            }
        },
        /**
         * Loads the root diagrams into the folder state
         *
         * @param context -
         * @param routeId Route
         */
        async loadDiagrams(context: ActionContext<StartState, RootState>, routeId: number): Promise<void> {
            const path = routeId ? `/api/folders/${routeId}/diagrams` : "/api/diagrams/root";

            const res = await GET(path);
            if (res.status === 200) {
                context.commit("loadDiagrams", await res.json());
                context.commit("sortDiagrams");
            }
        },
        /**
         * Loads the root folders into the folder state
         *
         * @param context -
         * @param routeId Route
         */
        async loadFolders(context: ActionContext<StartState, RootState>, routeId: number): Promise<void> {
            const path = routeId ? `/api/folders/${routeId}/folders` : "/api/folders/root";

            const res = await GET(path);
            if (res.status === 200) {
                context.commit("loadFolders", await res.json());
                context.commit("sortFolders");
            }
        },
    },
    getters: {
        /**
         * Fetches current root folders
         *
         * @param state
         * @return Returns a string of root folders
         */
        folders(state: StartState): Folder[] {
            return state.folders;
        },
        /**
         * Fetches current root diagrams
         *
         * @param state
         * @return Returns a string of root diagrams
         */
        diagrams(state: StartState): Diagram[] {
            return state.diagrams;
        },
    },
    modules: {},
};
