import ApiNode from "@/models/data-scheme/ApiNode";

type SerializableHeatConfig = new () => { readonly type: string };

/**
 * The different possible heat configuration types
 */
export enum HeatConfigType {
    COLOR = "color",
    ENUM = "enum",
    NUMBER = "number",
}

/**
 * The interface for a configuration
 */
export abstract class HeatConfig {
    /**
     * Type registry for reviving heat configs from json strings
     */
    private static readonly typeRegistry: Record<string, SerializableHeatConfig> = {};
    /**
     * The attribute name
     */
    public readonly attrName: string;
    /**
     * The config type
     */
    abstract type: string;

    /**
     * Constructor
     *
     * @param attrName The name of the config attribute
     */
    protected constructor(attrName: string) {
        this.attrName = attrName;
    }

    /**
     * Decorator for adding classes to the typeRegistry
     */
    static serializable<T extends SerializableHeatConfig>(constructor: T): T {
        HeatConfig.typeRegistry[new constructor().type] = constructor;
        return constructor;
    }

    /**
     * Reviver that restores the correct heat config instance
     */
    // eslint-disable-next-line
    static readonly reviver = (k: string, v: any): any =>
        typeof v === "object" && "type" in v && v.type in HeatConfig.typeRegistry
            ? Object.assign(new HeatConfig.typeRegistry[v.type](), v)
            : v;

    /**
     * Get the matching color for a given node
     *
     * @param node The api node containing the actual values
     */
    abstract getColor(node?: ApiNode): string;
}
