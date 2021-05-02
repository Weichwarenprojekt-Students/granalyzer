import ApiNode from "@/models/data-scheme/ApiNode";

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
     * Get the matching color for a given node
     *
     * @param node The api node containing the actual values
     */
    abstract getColor(node?: ApiNode): string;
}
