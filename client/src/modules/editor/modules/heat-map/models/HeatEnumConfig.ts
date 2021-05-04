import { HeatConfig, HeatConfigType } from "@/modules/editor/modules/heat-map/models/HeatConfig";
import { DEFAULT_COLOR, getLinearColor } from "@/modules/editor/modules/heat-map/utility";
import ApiNode from "@/models/data-scheme/ApiNode";

@HeatConfig.serializable
export class HeatEnumConfig extends HeatConfig {
    /**
     * The config type
     */
    public readonly type = HeatConfigType.ENUM;

    /**
     * The color values for each enum value
     */
    public readonly valueColors = new Map<string, string>();

    /**
     * The possible enum values
     */
    public values: Array<string>;

    /**
     * Constructor
     *
     * @param attrName The name of the config attribute
     * @param values The enum values
     */
    constructor(attrName = "", values: Array<string> = []) {
        super(attrName);
        this.values = values;
        this.updateColors();
    }

    /**
     * Update the colors for each enum value depending on
     * the list's order
     */
    public updateColors(): void {
        this.values.forEach((value, i) => {
            this.valueColors.set(value, getLinearColor(0, this.values.length - 1, i));
        });
    }

    /**
     * Get the matching color for a given node
     *
     * @param node The api node containing the actual values
     */
    public getColor(node?: ApiNode): string {
        const value: string = node?.attributes[this.attrName]?.toString() ?? "";
        return this.valueColors.get(value) ?? DEFAULT_COLOR;
    }
}
