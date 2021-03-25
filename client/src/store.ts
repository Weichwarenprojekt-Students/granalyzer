import { createStore } from "vuex";
import { start } from "@/modules/start/store";
import { editor } from "@/modules/editor/store";
import { inventory } from "@/modules/inventory/store";
import { Locales } from "@/i18n";

export class RootState {
    public locale: string = navigator.language.split("-")[0];
    public sidebarMinimized = false;
}

export default createStore({
    state: new RootState(),
    mutations: {
        setLocale(state, payload): void {
            if (Object.values(Locales).includes(payload.lang)) {
                state.locale = payload.lang;
                payload.i18n.locale = payload.lang;
            }
        },
        minimizeSidebar(state, value): void {
            state.sidebarMinimized = value;
        },
    },
    actions: {
        minimizeSidebar(context, value): void {
            context.commit("minimizeSidebar", value);
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
