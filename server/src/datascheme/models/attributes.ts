// Deserialization of JSON objects with inheritance:
// https://stackoverflow.com/questions/54427218/parsing-complex-json-objects-with-inheritance
type SerializableAttribute = new () => { readonly datatype: string };

export abstract class Attribute {
    /**
     * Registry of possible values of data types and their respective typescript classes
     */
    private static readonly typeRegistry: Record<string, SerializableAttribute> = {};

    /**
     * Name of the attribute
     */
    name = "";

    /**
     * Indicator if the attribute is mandatory
     */
    mandatory = false;

    /**
     * Decorator for automatically filling the data type registry
     *
     * @param constructor the typescript class constructor of possible attribute types
     */
    static serializable<T extends SerializableAttribute>(constructor: T) {
        Attribute.typeRegistry[new constructor().datatype] = constructor;
        return constructor;
    }

    /**
     * Deserialize attribute from a JSON string into the corresponding typescript object
     *
     * @param json the JSON string
     */
    static deserializeAttributeFromJSON(json: string): Attribute {
        return JSON.parse(json, Attribute.reviver);
    }

    /**
     * Reviver used for deserializing the attributes into the correct typescript objects
     *
     * @param k key
     * @param v value
     */
    private static readonly reviver = (k: string, v: any) =>
        typeof v === "object" && "datatype" in v && v.datatype in Attribute.typeRegistry
            ? Object.assign(new Attribute.typeRegistry[v.datatype](), v)
            : v;
}

@Attribute.serializable
export class StringAttribute extends Attribute {
    /**
     * datatype of the string attribute
     */
    readonly datatype = "string";

    /**
     * Default string value
     */
    defaultValue = "";
}

@Attribute.serializable
export class NumberAttribute extends Attribute {
    /**
     * datatype of the number attribute
     */
    readonly datatype = "number";

    /**
     * Default number value
     */
    defaultValue = 0;
}

/**
 * color attribute serializes attribute
 */
@Attribute.serializable
export class ColorAttribute extends Attribute {
    /**
     * datatype of the color attribute
     */
    readonly datatype = "color";

    /**
     * Default color value
     */
    defaultValue = "#000";
}
