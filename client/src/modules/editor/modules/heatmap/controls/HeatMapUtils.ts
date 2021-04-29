import ApiNode from "@/models/data-scheme/ApiNode";
import { GET, getBrightness, isUnexpected } from "@/utility";
import { dia } from "jointjs";

export class HeatMapUtils {
    /**
     * Gets the color according a linear gradient red-yellow-green
     */
    getLinearColor(start: number, stop: number, value: number): string {
        // Start and stop boundaries of the gradient
        const startColor = "#F00";
        const endColor = "#0F0";

        // Check if value is outside the given interval
        const outsideBoundaries = this.isOutsideBoundaries(start, stop, value);
        if (outsideBoundaries === 1) return endColor;
        else if (outsideBoundaries === -1) return startColor;

        // Calculate the position of the value on the gradient
        const delta = value >= start ? value - start : value - stop;
        const stepSize = (Math.abs(start - stop) + 1) / 512;
        const amountSteps = Math.floor(delta / stepSize);

        // Helper to fill each hex value to two chars
        const padHex = (hex: string) => (hex.length === 1 ? "0" + hex : hex);

        // Get the according red and green values
        const g = amountSteps > 255 ? "FF" : padHex(amountSteps.toString(16));
        const r = amountSteps > 255 ? padHex((255 - (amountSteps - 256)).toString(16)) : "FF";

        // Concat to final color
        return "#" + r + g + "00";
    }

    /**
     * Returns 1 if outside stop boundary, and -1 if outside start boundary.
     * 0 is returned if inside the interval
     */
    isOutsideBoundaries(start: number, stop: number, value: number): number {
        if (start < stop) {
            if (value < start) return -1;
            if (value > stop) return 1;
        } else {
            if (value > start) return -1;
            if (value < stop) return 1;
        }

        return 0;
    }

    async fetchNode(uuid: string): Promise<ApiNode | undefined> {
        // Fetch node data
        const result = await GET(`/api/nodes/${uuid}`);
        if (isUnexpected(result)) return;
        return result.json();
    }

    setNodeColor(node: dia.Element, color: string): void {
        node.attr("body/fill", color);
        node.attr("label/fill", getBrightness(color) > 170 ? "#333" : "#FFF");
    }
}
