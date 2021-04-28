// Deserialization of JSON objects with inheritance:
// https://stackoverflow.com/questions/54427218/parsing-complex-json-objects-with-inheritance
import { Datatype } from "./data-type.model";
import { IsBoolean, IsDefined, IsEnum, IsOptional, IsString } from "class-validator";

type SerializableAttribute = new () => { readonly datatype: string };

export abstract class Attribute {
    /**
     * Registry of possible values of data types and their respective typescript classes
     */
    private static readonly typeRegistry: Record<string, SerializableAttribute> = {};

    /**
     * Name of the attribute
     */
    @IsString()
    name: string;

    /**
     * Indicator if the attribute is mandatory
     */
    @IsBoolean()
    mandatory: boolean;

    /**
     * Datatype of the attribute
     */
    @IsEnum(Datatype)
    abstract datatype: string;

    /**
     * The default value of the attribute
     */
    @IsDefined()
    abstract defaultValue;

    /**
     * The configuration of the value (required for enums)
     */
    @IsOptional()
    config?;

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
}

@Attribute.serializable
export class StringAttribute extends Attribute {
    /**
     * datatype of the string attribute
     */
    readonly datatype = Datatype.STRING;

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
    readonly datatype = Datatype.NUMBER;

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
    readonly datatype = Datatype.COLOR;

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

/**
 * enum attribute serializes attribute
 */
@Attribute.serializable
export class EnumAttribute extends Attribute {
    /**
     * datatype of the enum attribute
     */
    readonly datatype = Datatype.ENUM;

    /**
     * List of all values
     */
    config: string[] = [];

    /**
     * Default enum value
     */
    defaultValue: string;

    /**
     * Constructor
     *
     * @param name name of the attribute
     * @param mandatory indicate if the attribute is mandatory
     * @param defaultValue default value if the attribute is mandatory
     * @param config list of all values
     */
    constructor(name?: string, mandatory?: boolean, defaultValue?: string, config?: string[]) {
        super();
        this.name = name ?? "";
        this.mandatory = mandatory ?? false;
        this.config = config ?? [];
        if (this.config.includes(defaultValue)) {
            this.defaultValue = defaultValue ?? "";
        }
    }
}
