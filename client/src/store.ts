import { createStore } from "vuex";
import { start, StartState } from "@/modules/start/store";
import { editor, EditorState } from "@/modules/editor/store";
import { inventory } from "@/modules/inventory/store";
import { schemes, SchemesState } from "@/modules/schemes/store";

export class RootState {
    /**
     * The short form of the currently set language
     */
    public locale: string = navigator.language.split("-")[0];
    /**
     * True if the sidebar is minimized
     */
    public sidebarMinimized = false;

    /**
     * Start state
     */
    public start?: StartState;

    /**
     * Editor state
     */
    public editor?: EditorState;

    /**
     * Schemes state
     */
    public schemes?: SchemesState;
}

export default createStore({
    state: new RootState(),
    mutations: {
        /**
         * Change the state of the sidebar
         */
        minimizeSidebar(state, value): void {
            state.sidebarMinimized = value;
        },
    },
    modules: {
        start,
        editor,
        inventory,
        schemes,
    },
});
