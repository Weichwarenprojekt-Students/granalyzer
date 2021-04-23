import { ToastServiceMethods } from "primevue/toastservice";
import i18n from "@/i18n";

/**
 * The route names of the three main modules
 */
export const routeNames = {
    start: "/home",
    editor: "/editor",
    inventory: "/inventory",
    schemes: "/schemes",
};

/**
 * Calculate the brightness for a given color
 *
 * @param color The color as a string in hex format
 */
export function getBrightness(color: string): number {
    let brightness = 0;
    const parsedHex = parseInt(color.substr(1), 16);
    if (parsedHex) {
        // Get R, G, B values from hex-code
        const R = (parsedHex >> 16) & 255;
        const G = (parsedHex >> 8) & 255;
        const B = parsedHex & 255;

        // Calculate color brightness from RGB-values
        brightness = R * 0.299 + G * 0.587 + B * 0.114;
    }
    return brightness;
}

/**
 * The pointer for the next object uuid
 */
let __granObjectUUID = 0;

/**
 * This method determines an id for any given object.
 * It will simply set a special id field on demand.
 * This is especially helpful for vue loops when iterating over a list
 * of objects that hasn't a direct id field. Than you can simply use
 * this method to set "key" values
 *
 * @param obj The object that needs an id
 * @return The special object id
 */
// eslint-disable-next-line
export function objectUUID(obj: any): number {
    if (!obj.__granObjectUUID) {
        obj.__granObjectUUID = __granObjectUUID;
        __granObjectUUID++;
    }
    return obj.__granObjectUUID;
}

/**
 * Determine whether an object is empty
 *
 * @param object The object to be checked
 * @return True if the object is null
 */
// eslint-disable-next-line
export function isEmpty(object: any): boolean {
    return Object.keys(object).length === 0;
}

/**
 * Create a deep-copy of any object
 *
 * @param obj The object to be copied
 */
export function deepCopy<Type>(obj: Type): Type {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * The default headers for server requests
 */
export const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
};

/**
 * Execute a GET request
 *
 * @param path The path of the request
 */
export function GET(path: string): Promise<Response> {
    return fetch(path);
}

/**
 * Execute a POST request
 *
 * @param path The path of the request
 * @param body The body
 */
export function POST(path: string, body: string): Promise<Response> {
    return fetch(path, {
        headers,
        method: "POST",
        body: body,
    });
}

/**
 * Execute a PUT request
 *
 * @param path The path of the request
 * @param body The body
 */
export function PUT(path: string, body: string): Promise<Response> {
    return fetch(path, {
        headers,
        method: "PUT",
        body: body,
    });
}

/**
 * Execute a DELETE request
 *
 * @param path The path of the request
 */
export function DELETE(path: string): Promise<Response> {
    return fetch(path, {
        headers,
        method: "DELETE",
    });
}

/**
 * Check if a response is unexpected
 *
 * @param response The response that shall be checked
 */
export function isUnexpected(response: Response): boolean {
    if (response.status >= 300) {
        errorToast(i18n.global.t("global.unexpected.title"), i18n.global.t("global.unexpected.description"));
        return true;
    }
    return false;
}

/**
 * The toast service
 */
let toast: ToastServiceMethods;

/**
 * Set the toast service
 */
export function setToastService(toastService: ToastServiceMethods): void {
    toast = toastService;
}

/**
 * The current error toast count
 */
let toastCount = 0;

/**
 * Show an error toast
 *
 * @param summary The title
 * @param detail The description
 * @param life The time the toast is shown (in milliseconds)
 */
export function errorToast(summary: string, detail: string, life = 3000): void {
    toast.add({
        severity: "error",
        summary,
        detail,
        life,
    });

    // Track the toast
    toastCount++;
    setTimeout(() => (toastCount = Math.max(0, --toastCount)), life);

    // Show easter egg toast
    if (toastCount < 3) return;
    toastCount = 0;
    toast.removeAllGroups();
    warnToast(i18n.global.t("global.stopSpamming.title"), i18n.global.t("global.stopSpamming.description"), 10000);
}

/**
 * Show a success toast
 *
 * @param summary The title
 * @param detail The description
 * @param life The time the toast is shown (in milliseconds)
 */
export function successToast(summary: string, detail: string, life = 3000): void {
    toast.add({
        severity: "success",
        summary,
        detail,
        life,
    });
}

/**
 * Show an info toast
 *
 * @param summary The title
 * @param detail The description
 * @param life The time the toast is shown (in milliseconds)
 */
export function infoToast(summary: string, detail: string, life = 3000): void {
    toast.add({
        severity: "info",
        summary,
        detail,
        life,
    });
}

/**
 * Show a warn toast
 *
 * @param summary The title
 * @param detail The description
 * @param life The time the toast is shown (in milliseconds)
 */
export function warnToast(summary: string, detail: string, life = 3000): void {
    toast.add({
        severity: "warn",
        summary,
        detail,
        life,
    });
}
