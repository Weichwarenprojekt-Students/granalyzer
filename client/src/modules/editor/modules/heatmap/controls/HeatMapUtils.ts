import ApiNode from "@/models/data-scheme/ApiNode";
import { clamp, GET, getFontColor, hsv2rgb, isUnexpected, toPaddedHex } from "@/utility";
import { dia } from "jointjs";
import { ApiDatatype } from "@/models/data-scheme/ApiDatatype";
import { HeatMapAttribute } from "@/modules/editor/modules/heatmap/models/HeatMapAttribute";

export class HeatMapUtils {
    /**
     * Get the color on a linear HSV gradient, clamped if value is outside of interval
     *
     * @param min The min value
     * @param max The max value
     * @param value The value to get the color on the gradient for
     */
    getLinearColor(min: number, max: number, value: number): string {
        // Min and max value of the hue in HSV colors
        // The gradient is just calculated from a linear hue, which goes from red at 0 over yellow to green at 120.
        // It can go even further all the way around to red again over cyan, blue, and purple, each in steps of 60.
        const hueMin = 0;
        const hueMax = 120;

        // Calculate m and t for linear function y = m * x + t
        const m = (hueMax - hueMin) / (max - min);
        const t = hueMin - m * min;

        // Calculate the hue on the gradient for the value and clamp it between min and max hue
        const gradientHue = clamp(m * value + t, hueMin, hueMax);

        // Calculate HSV to RGB colors
        const [r, g, b] = hsv2rgb(gradientHue, 1, 0.9);

        // Return color as hex code
        return "#" + toPaddedHex(r) + toPaddedHex(g) + toPaddedHex(b);
    }

    async fetchNode(uuid: string): Promise<ApiNode | undefined> {
        // Fetch node data
        const result = await GET(`/api/nodes/${uuid}`);
        if (isUnexpected(result)) return;
        return result.json();
    }

    setNodeColor(node: dia.Element, color: string): void {
        // TODO: apply correct styling
        node.attr("body/fill", color);
        node.attr("label/fill", getFontColor(color));
    }

    /**
     * Parse the nodes attribute value by the datatype; Enum value becomes the position in the definition
     */
    parseNodeValueByDataType(heatMapAttribute: HeatMapAttribute, nodeValue: string | number): number {
        if (heatMapAttribute.selectedAttribute?.datatype === ApiDatatype.ENUM) {
            // Enum by index
            return heatMapAttribute.selectedAttribute.config.indexOf(nodeValue.toString()) ?? 0;
        } else {
            return parseFloat(nodeValue.toString());
        }
    }
}
