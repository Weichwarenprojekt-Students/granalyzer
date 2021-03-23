import { createStore } from "vuex";
import { start } from "@/modules/start/store";
import { editor } from "@/modules/editor/store";
import { inventory } from "@/modules/inventory/store";
import { Locales } from "@/i18n";

export default createStore({
    state: {
        locale: navigator.language.split("-")[0],
    },
    mutations: {
        setLocale(state, payload) {
            if (Object.values(Locales).includes(payload.lang)) {
                state.locale = payload.lang;
                payload.i18n.locale = payload.lang;
            }
        },
    },
    actions: {},
    getters: {},
    modules: {
        start,
        editor,
        inventory,
    },
});
