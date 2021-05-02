import { HeatConfig, HeatConfigType } from "@/modules/editor/modules/heat-map/models/HeatConfig";
import { DEFAULT_COLOR } from "@/modules/editor/modules/heat-map/utility";
import ApiNode from "@/models/data-scheme/ApiNode";
import { isHexColor } from "class-validator";

@HeatConfig.serializable
export class HeatColorConfig extends HeatConfig {
    /**
     * The config type
     */
    public readonly type = HeatConfigType.COLOR;

    /**
     * Constructor
     *
     * @param attrName The name of the config attribute
     */
    constructor(attrName = "") {
        super(attrName);
    }

    /**
     * Get the matching color for a given node
     *
     * @param node The api node containing the actual values
     */
    public getColor(node?: ApiNode): string {
        const color: string = node?.attributes[this.attrName]?.toString() ?? "";
        return isHexColor(color) ? color : DEFAULT_COLOR;
    }
}
