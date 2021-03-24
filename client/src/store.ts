import { createStore } from "vuex";
import { start } from "@/modules/start/store";
import { editor } from "@/modules/editor/store";
import { inventory } from "@/modules/inventory/store";
import { Locales } from "@/i18n";

export default createStore({
    state: {
        locale: navigator.language.split("-")[0],
        sidebarMinimized: false,
    },
    mutations: {
        setLocale(state, payload) {
            if (Object.values(Locales).includes(payload.lang)) {
                state.locale = payload.lang;
                payload.i18n.locale = payload.lang;
            }
        },
        toggleSidebar(state): void {
            state.sidebarMinimized = !state.sidebarMinimized;
        },
    },
    actions: {
        toggleSidebar(context): void {
            context.commit("toggleSidebar");
        },
    },
    getters: {
        sidebarMinimized(state): boolean {
            return state.sidebarMinimized;
        },
    },
    modules: {
        start,
        editor,
        inventory,
    },
});
