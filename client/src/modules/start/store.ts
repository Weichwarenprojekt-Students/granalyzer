import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { Folder } from "@/modules/start/models/Folder";
import { Diagram } from "@/modules/start/models/Diagram";

export class StartState {
    public folders = [] as Folder[];
    public diagrams = [] as Diagram[];
}

export const start = {
    state: new StartState(),
    mutations: {
        /**
         * Adds a diagram to the tool database
         *
         * @param state Storage state
         * @param diagram Diagram to be put into the database
         */
        async addDiagram(state: StartState, diagram: Diagram): Promise<void> {
            const res = await fetch("api/diagrams", {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify(diagram),
            });

            if (res.status === 201) state.diagrams.push(await res.json());
        },
        /**
         * Adds a folder to the tool database
         *
         * @param state Storage state
         * @param folder Folder to be put into the database
         */
        async addFolder(state: StartState, folder: Folder): Promise<void> {
            const res = await fetch("api/folders", {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify(folder),
            });

            if (res.status === 201) state.folders.push(await res.json());
        },
        /**
         * Deletes a folder in the tool database
         *
         * @param state Storage state
         * @param folder Folder to be deleted
         */
        async deleteFolder(state: StartState, folder: Folder): Promise<void> {
            const res = await fetch("api/folders/" + folder.id, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                method: "DELETE",
                body: JSON.stringify(folder),
            });

            if (res.status === 200) state.folders = state.folders.filter((item) => item.id !== folder.id);
        },
        /**
         * Deletes a folder in the tool database
         *
         * @param state Storage state
         * @param diagram Diagram to be deleted
         */
        async deleteDiagram(state: StartState, diagram: Diagram): Promise<void> {
            const res = await fetch("api/diagrams/" + diagram.id, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                method: "DELETE",
                body: JSON.stringify(diagram),
            });

            if (res.status === 200) state.diagrams = state.diagrams.filter((item) => item.id !== diagram.id);
        },
        /**
         * Edits a folder and updates the name
         *
         * @param state Storage state
         * @param folder Folder to be updated
         */
        async editFolder(state: StartState, folder: Folder): Promise<void> {
            const res = await fetch("api/folders/" + folder.id, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                method: "PUT",
                body: JSON.stringify(folder),
            });

            if (res.status === 200) {
                state.folders = state.folders.filter((item) => item.id !== folder.id);
                state.folders.push(await res.json());
            }
        },
        /**
         * Edits a diagram and updates the name
         *
         * @param state Storage state
         * @param diagram Folder to be updated
         */
        async editDiagram(state: StartState, diagram: Diagram): Promise<void> {
            const res = await fetch("api/diagrams/" + diagram.id, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                method: "PUT",
                body: JSON.stringify(diagram),
            });

            if (res.status === 200) {
                state.diagrams = state.diagrams.filter((item) => item.id !== diagram.id);
                state.diagrams.push(await res.json());
            }
        },
        /**
         * Loads the root folders into the folder state
         *
         * @param state Storage state
         */
        async loadFolders(state: StartState): Promise<void> {
            const result = await fetch("api/folders");
            state.folders = await result.json();
        },
        /**
         * Loads the root diagrams into the diagram state
         *
         * @param state Storage state
         */
        async loadDiagrams(state: StartState): Promise<void> {
            const result = await fetch("api/diagrams");
            state.diagrams = await result.json();
        },
    },
    actions: {
        /**
         * Adds a diagram to the tool-database
         *
         * @param context -
         * @param diagram Diagram to be added
         */
        addDiagram(context: ActionContext<StartState, RootState>, diagram: Diagram): void {
            context.commit("addDiagram", diagram);
        },
        /**
         * Adds a folder to the tool-database
         *
         * @param context -
         * @param folder Folder to be added
         */
        addFolder(context: ActionContext<StartState, RootState>, folder: Folder): void {
            context.commit("addFolder", folder);
        },
        /**
         * Deletes a diagram
         *
         * @param context -
         * @param diagram Diagram to be deleted
         */
        deleteDiagram(context: ActionContext<StartState, RootState>, diagram: Diagram): void {
            context.commit("deleteDiagram", diagram);
        },
        /**
         * Deletes a folder
         *
         * @param context -
         * @param folder Folder to be deleted
         */
        deleteFolder(context: ActionContext<StartState, RootState>, folder: Folder): void {
            context.commit("deleteFolder", folder);
        },
        /**
         * Changes the name of a diagram
         *
         * @param context -
         * @param diagram New diagram values
         */
        editDiagram(context: ActionContext<StartState, RootState>, diagram: Diagram): void {
            context.commit("editDiagram", diagram);
        },
        /**
         * Changes the name of a folder
         *
         * @param context -
         * @param folder New folder values
         */
        editFolder(context: ActionContext<StartState, RootState>, folder: Folder): void {
            context.commit("editFolder", folder);
        },
        /**
         * Loads the root folders into the folder state
         *
         * @param context -
         */
        loadFolders(context: ActionContext<StartState, RootState>): void {
            context.commit("loadFolders");
        },
        /**
         * Loads the root diagrams into the folder state
         *
         * @param context -
         */
        loadDiagrams(context: ActionContext<StartState, RootState>): void {
            context.commit("loadDiagrams");
        },
    },
    getters: {
        /**
         * Fetches current root folders
         *
         * @param state
         * @return Returns a string of root folders
         */
        getFolders(state: StartState): Folder[] {
            return state.folders;
        },
        /**
         * Fetches current root diagrams
         *
         * @param state
         * @return Returns a string of root diagrams
         */
        getDiagrams(state: StartState): Diagram[] {
            return state.diagrams;
        },
    },
    modules: {},
};
