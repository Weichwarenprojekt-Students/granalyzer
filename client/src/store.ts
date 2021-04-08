import { createStore } from "vuex";
import { start, StartState } from "@/modules/start/store";
import { editor, EditorState } from "@/modules/editor/store";
import { inventory } from "@/modules/inventory/store";
import { Locales } from "@/i18n";
import { VueI18n } from "vue-i18n";

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
}

export default createStore({
    state: new RootState(),
    mutations: {
        /**
         * Dynamically set the active language
         */
        setLocale(state, payload: { i18n: VueI18n; lang: Locales }): void {
            if (Object.values(Locales).includes(payload.lang)) {
                state.locale = payload.lang;
                payload.i18n.locale = payload.lang;
            }
        },
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
    },
});
