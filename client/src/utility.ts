import { ToastServiceMethods } from "primevue/toastservice";
import i18n from "@/i18n";
import { isHexColor } from "class-validator";
import hexRgb from "hex-rgb";

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
 * Get the matching font color for a certain background color
 *
 * @param color The color as a string in hex format
 */
export function getFontColor(color: string): string {
    if (!isHexColor(color)) return "#333";

    // Calculate brightness
    const { red, green, blue, alpha } = hexRgb(color);
    const brightness = (1 - alpha) * 255 + (red * 0.299 + green * 0.587 + blue * 0.114);

    // Determine whether font should be white
    return brightness > 128 ? "#333" : "#FFF";
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
 * @param displayToast True if a toast should be displayed
 */
export function isUnexpected(response: Response, displayToast = true): boolean {
    if (response.status >= 300) {
        if (displayToast)
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
    if (toastCount < 4) return;
    toastCount = 0;
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

/**
 * Provide wrapper for Promise.allSettled() that just returns the values of fulfilled promises
 *
 * @param promises All promises to await
 */
export async function allFulfilledPromises<T>(promises: Array<Promise<T>>): Promise<Array<T>> {
    return (await Promise.allSettled(promises))
        .filter((result): result is PromiseFulfilledResult<T> => result.status === "fulfilled")
        .map((res: PromiseFulfilledResult<T>) => res.value);
}

/**
 * Returns a random range that is also randomly positive or negative
 *
 * @param min Minimum number generated
 * @param max Maximum number generated
 * @return Returns a number that is randomly positive or negative within the given range
 */
export function randomRange(min: number, max: number): number {
    let rand = Math.random() * (max - min) + min;

    if (Math.random() < 0.5) {
        rand = rand * -1;
    }

    return rand;
}

/**
 * Clamp a number between a minimum and a maximum
 *
 * @param num The number
 * @param min The minimum
 * @param max The maximum
 */
export function clamp(num: number, min: number, max: number): number {
    return num <= min ? min : num >= max ? max : num;
}

/**
 * Convert hue, saturation, and value from HSV colors to RGB
 *
 * See: https://stackoverflow.com/a/54024653/15087314
 */
export function hsv2rgb(h: number, s: number, v: number): [number, number, number] {
    const f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [Math.round(f(5) * 255), Math.round(f(3) * 255), Math.round(f(1) * 255)];
}

/**
 * Convert a number to a hex string of length 2 with leading 0
 */
export function toPaddedHex(num: number): string {
    const hex = num.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}
