import { createI18n } from "vue-i18n";
import app_en from "./en.json";
import app_de from "./de.json";
import editor_en from "@/modules/editor/i18n/en.json";
import editor_de from "@/modules/editor/i18n/de.json";
import inspector_en from "@/modules/inspector/i18n/en.json";
import inspector_de from "@/modules/inspector/i18n/de.json";
import inventory_en from "@/modules/inventory/i18n/en.json";
import inventory_de from "@/modules/inventory/i18n/de.json";
import overview_list_en from "@/modules/overview-list/i18n/en.json";
import overview_list_de from "@/modules/overview-list/i18n/de.json";
import schemes_en from "@/modules/schemes/i18n/en.json";
import schemes_de from "@/modules/schemes/i18n/de.json";
import start_en from "@/modules/start/i18n/en.json";
import start_de from "@/modules/start/i18n/de.json";

export enum Locales {
    EN = "en",
    DE = "de",
}

export const LOCALES = [
    { value: Locales.EN, caption: "English" },
    { value: Locales.DE, caption: "Deutsch" },
];

export const messages = {
    [Locales.EN]: {
        global: app_en,
        editor: editor_en,
        inspector: inspector_en,
        inventory: inventory_en,
        overviewList: overview_list_en,
        schemes: schemes_en,
        start: start_en,
    },
    [Locales.DE]: {
        global: app_de,
        editor: editor_de,
        inspector: inspector_de,
        inventory: inventory_de,
        overviewList: overview_list_de,
        schemes: schemes_de,
        start: start_de,
    },
};

export const defaultLocale = Locales.EN;

export default createI18n({
    legacy: false,
    locale: navigator.language.split("-")[0],
    fallbackLocale: Locales.EN,
    messages: messages,
    globalInjection: true,
});
