import { Locales } from "@/i18n/locales";
import { createI18n } from "vue-i18n";

import en from "./en.json";
import de from "./de.json";

export const messages = {
    [Locales.EN]: en,
    [Locales.DE]: de,
};

export const defaultLocale = Locales.EN;

export default createI18n({
    legacy: false,
    locale: navigator.language.split("-")[0],
    fallbackLocale: Locales.EN,
    messages: messages,
    globalInjection: true,
});
