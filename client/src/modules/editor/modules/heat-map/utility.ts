import { clamp, hsl2rgb, toPaddedHex } from "@/utility";

/**
 * The default fallback color
 */
export const DEFAULT_COLOR = "#808080";

/**
 * Get the color on a linear HSL gradient, clamped if value is outside of interval
 *
 * @param from The from value
 * @param to The to value
 * @param value The value to get the color on the gradient for
 */
export function getLinearColor(from: number, to: number, value: number): string {
    // Min and to value of the hue in HSL colors. If you change these values, you MUST also update global.less!
    // The gradient is just calculated from a linear hue, which goes from red at 0 over yellow to green at 120.
    // It can go even further all the way around to red again over cyan, blue, and purple, each in steps of 60.
    const hueMin = 0;
    const hueMax = 120;

    // Fix color generation for equaling from and to values, they should appear as the middle color
    if (from === to) [from, to] = [from - 1.0e-6, to + 1.0e-6];

    // Calculate m and t for linear function y = m * x + t
    const m = (hueMax - hueMin) / (to - from);
    const t = hueMin - m * from;

    // Calculate the hue on the gradient for the value and clamp it between min and max hue
    const gradientHue = clamp(m * value + t, hueMin, hueMax);

    // Calculate HSL to RGB colors
    // If you change any of these values, you MUST also update them in the global.less file!
    const [r, g, b] = hsl2rgb(gradientHue, 0.8, 0.5);

    // Return color as hex code
    return "#" + toPaddedHex(r) + toPaddedHex(g) + toPaddedHex(b);
}
