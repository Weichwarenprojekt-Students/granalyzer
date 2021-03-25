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
        async editFolder(state: StartState, folder: Folder): Promise<void> {
            await fetch("api/folders", {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                method: "PUT",
                body: JSON.stringify(folder),
            });
        },
        async editDiagram(state: StartState, diagram: Diagram): Promise<void> {
            await fetch("api/diagrams", {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                method: "PUT",
                body: JSON.stringify(diagram),
            });
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
