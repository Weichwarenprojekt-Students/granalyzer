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
 * Check if string is a color
 *
 * @param color The string that shall be checked
 * @return True if a given string is a color
 */
export function isColor(color: string): boolean {
    const s = new Option().style;
    s.color = color;
    return s.color !== "";
}

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
