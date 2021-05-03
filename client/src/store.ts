import { createStore } from "vuex";
import { start, StartState } from "@/modules/start/store";
import { editor, EditorState } from "@/modules/editor/store";
import { inventory, InventoryState } from "@/modules/inventory/store";
import { schemes, SchemesState } from "@/modules/schemes/store";
import { overview, OverviewState } from "@/modules/overview-list/store";
import { inspector, InspectorState } from "@/modules/inspector/store";

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

    /**
     * Inventory state
     */
    public inventory?: InventoryState;

    /**
     * Node overview list state
     */
    public overview?: OverviewState;

    /**
     * Inspector state
     */
    public inspector?: InspectorState;
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
        overview,
        inspector,
    },
});
