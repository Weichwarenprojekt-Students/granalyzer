import { HeatConfig, HeatConfigType } from "@/modules/editor/modules/heat-map/models/HeatConfig";
import { DEFAULT_COLOR, getLinearColor } from "@/modules/editor/modules/heat-map/utility";
import ApiNode from "@/models/data-scheme/ApiNode";
import { isNumber } from "class-validator";

export class HeatNumberConfig extends HeatConfig {
    /**
     * The config type
     */
    public readonly type = HeatConfigType.NUMBER;
    /**
     * The from value
     */
    public from = 0;
    /**
     * The to value
     */
    public to = 0;

    /**
     * Constructor
     *
     * @param attrName The name of the config attribute
     * @param nodes The
     */
    constructor(attrName: string, nodes: Array<ApiNode>) {
        super(attrName);

        // Initialize the from and to values
        const numbers: Array<number> = nodes
            .map((node) => node.attributes[this.attrName] as number)
            .filter((number) => isNumber(number));
        if (numbers.length < 1) return;
        this.from = Math.min(...numbers);
        this.to = Math.max(...numbers);
    }

    /**
     * Get the matching color for a given node
     *
     * @param node The api node containing the actual values
     */
    public getColor(node?: ApiNode): string {
        const value = node?.attributes[this.attrName] as number;
        if (!isNumber(value)) return DEFAULT_COLOR;
        else return getLinearColor(this.from, this.to, value);
    }
}
