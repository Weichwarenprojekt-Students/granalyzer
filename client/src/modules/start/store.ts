import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { Folder } from "@/modules/start/models/Folder";
import { Diagram } from "../../../../server/src/diagrams/diagram.model";

export class StartState {
    public folders = [] as Folder[];
    public diagrams = [] as Diagram[];
}

export const start = {
    state: new StartState(),
    mutations: {
        addFolder(state: StartState, diagramName: string): void {
            console.log(diagramName);
        },
        async loadFolders(state: StartState): Promise<void> {
            const result = await fetch("api/folders");
            state.folders = await result.json();
        },
        async loadDiagrams(state: StartState): Promise<void> {
            const result = await fetch("api/diagrams");
            state.diagrams = await result.json();
        },
    },
    actions: {
        addFolder(context: ActionContext<StartState, RootState>, diagramName: string): void {
            context.commit("addFolder", diagramName);
        },
        loadFolders(context: ActionContext<StartState, RootState>): void {
            context.commit("loadFolders");
        },
        loadDiagrams(context: ActionContext<StartState, RootState>): void {
            context.commit("loadDiagrams");
        },
    },
    getters: {
        getFolders(state: StartState): Folder[] {
            return state.folders;
        },
    },
    modules: {},
};
