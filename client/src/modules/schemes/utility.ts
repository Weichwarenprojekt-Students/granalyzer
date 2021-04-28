import { errorToast } from "@/utility";
import { ApiDatatype } from "@/models/data-scheme/ApiDatatype";
import i18n from "@/i18n";
import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";

/**
 * Validate attributes
 *
 * @param attributes The attributes
 */
export function validateAttributes(attributes: Array<ApiAttribute>): boolean {
    const names = new Set<string>();
    for (const attribute of attributes) {
        // If the name is empty
        if (attribute.name === "") {
            errorToast(
                i18n.global.t("schemes.attribute.nameRequired.title"),
                i18n.global.t("schemes.attribute.nameRequired.description"),
            );
            return false;
        }
        // If the name is a duplicate
        if (names.has(attribute.name)) {
            errorToast(
                i18n.global.t("schemes.attribute.nameDuplicate.title"),
                i18n.global.t("schemes.attribute.nameDuplicate.description", { name: attribute.name }),
            );
            return false;
        }
        // If the attribute is enum
        if (attribute.datatype === ApiDatatype.ENUM && !attribute.config.includes(attribute.defaultValue as string)) {
            errorToast(
                i18n.global.t("schemes.attribute.invalidEnumDefault.title"),
                i18n.global.t("schemes.attribute.invalidEnumDefault.description", { name: attribute.name }),
            );
            return false;
        }
        names.add(attribute.name);
    }
    return true;
}
