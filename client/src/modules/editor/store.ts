import { Diagram } from "@/modules/start/models/Diagram";
import { ActionContext } from "vuex";
import { RootState } from "@/store";

export class EditorState {
    /**
     * The currently edited diagram
     */
    public diagram = {} as Diagram;
}

export const editor = {
    namespaced: true,
    state: new EditorState(),
    mutations: {
        /**
         * Change the active diagram
         */
        setDiagram(state: EditorState, diagram: Diagram): void {
            state.diagram = diagram;
        },
    },
    actions: {
        /**
         * Change the active diagram
         */
        setDiagram(context: ActionContext<EditorState, RootState>, diagram: Diagram): void {
            context.commit("setDiagram", diagram);
        },
    },
};
