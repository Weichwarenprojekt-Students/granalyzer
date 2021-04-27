import { dia, shapes } from "jointjs";

/**
 * The possible shapes
 */
export enum NodeShapes {
    TEXT = "text",
    RECTANGLE = "rectangle",
    CIRCLE = "circle",
    DIAMOND = "diamond",
    CYLINDER = "cylinder",
}

/**
 * Return the right shape for a given type
 *
 * @param shape The type of node as string
 */
export function parseNodeShape(shape: string): dia.Element {
    switch (shape) {
        case NodeShapes.TEXT:
            return new shapes.standard.TextBlock();
        case NodeShapes.CIRCLE:
            return new shapes.standard.Circle();
        case NodeShapes.DIAMOND:
            return new shapes.standard.Polygon();
        case NodeShapes.CYLINDER:
            return new shapes.standard.Cylinder();
        default:
            return new shapes.standard.Rectangle();
    }
}
