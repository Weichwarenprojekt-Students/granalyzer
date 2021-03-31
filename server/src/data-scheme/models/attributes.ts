// Deserialization of JSON objects with inheritance:
// https://stackoverflow.com/questions/54427218/parsing-complex-json-objects-with-inheritance
import * as neo4j from "neo4j-driver";
import MandatoryAttributeMissingException from "../../util/exceptions/MandatoryAttributeMissing.exception";

type SerializableAttribute = new () => { readonly datatype: string };

export abstract class Attribute {
    /**
     * Registry of possible values of data types and their respective typescript classes
     */
    private static readonly typeRegistry: Record<string, SerializableAttribute> = {};

    /**
     * Name of the attribute
     */
    name: string;

    /**
     * Indicator if the attribute is mandatory
     */
    mandatory: boolean;

    /**
     * Datatype of the attribute
     */
    abstract datatype: string;

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
     * Deserialize attributes from a JSON string into the corresponding typescript objects
     *
     * @param json the JSON string
     */
    static fromJson(json: string) {
        return JSON.parse(json, Attribute.reviver);
    }

    /**
     * Reviver used for deserializing the attributes into the correct typescript objects
     *
     * @param k key
     * @param v value
     */
    static readonly reviver = (k: string, v: any) =>
        typeof v === "object" && "datatype" in v && v.datatype in Attribute.typeRegistry
            ? Object.assign(new Attribute.typeRegistry[v.datatype](), v)
            : v;

    /**
     * Converts an element by the definition of a given attribute scheme
     */
    static applyOnElement(attribute: Attribute, element: any) {
        // Check for mandatory attributes
        if (attribute.mandatory && !element) {
            throw new MandatoryAttributeMissingException("Mandatory attribute is missing on requested node");
        }

        // Convert Attributes by datatype
        switch (attribute.datatype) {
            case "number":
                element = neo4j.integer.toNumber(element);
                break;
            case "string":
            default:
                element = neo4j.integer.toString(element);
        }

        return element;
    }
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
    defaultValue: string;

    /**
     * Constructor
     *
     * @param name name of the attribute
     * @param mandatory indicate if the attribute is mandatory
     * @param defaultValue default value if the attribute is mandatory
     */
    constructor(name?: string, mandatory?: boolean, defaultValue?: string) {
        super();
        this.name = name ?? "";
        this.mandatory = mandatory ?? false;
        this.defaultValue = defaultValue ?? "";
    }
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
    defaultValue: number;

    /**
     * Constructor
     *
     * @param name name of the attribute
     * @param mandatory indicate if the attribute is mandatory
     * @param defaultValue default value if the attribute is mandatory
     */
    constructor(name?: string, mandatory?: boolean, defaultValue?: number) {
        super();
        this.name = name ?? "";
        this.mandatory = mandatory ?? false;
        this.defaultValue = defaultValue ?? 0;
    }
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
    defaultValue: string;

    /**
     * Constructor
     *
     * @param name name of the attribute
     * @param mandatory indicate if the attribute is mandatory
     * @param defaultValue default value if the attribute is mandatory
     */
    constructor(name?: string, mandatory?: boolean, defaultValue?: string) {
        super();
        this.name = name ?? "";
        this.mandatory = mandatory ?? false;
        this.defaultValue = defaultValue ?? "#000";
    }
}
