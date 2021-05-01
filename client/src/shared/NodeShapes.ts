import { dia, shapes } from "jointjs";
import { getFontColor } from "@/utility";
import { NodeInfo } from "@/modules/editor/modules/graph-editor/controls/nodes/models/NodeInfo";
import { NodeDrag } from "@/shared/NodeDrag";

/**
 * The default color for nodes that don't have any color specified
 */
export const DEFAULT_COLOR = "#333333";

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
 * Return the styled shape for a given node info
 *
 * @param info The node info
 */
export function getStyledShape(info: NodeInfo): dia.Element {
    let shape: dia.Element;
    switch (info.shape) {
        case NodeShapes.TEXT:
            shape = getTextShape();
            break;
        case NodeShapes.CIRCLE:
            shape = getCircleShape();
            break;
        case NodeShapes.DIAMOND:
            shape = getDiamondShape();
            break;
        case NodeShapes.CYLINDER:
            shape = getCylinderShape();
            break;
        default:
            shape = getRectangleShape();
    }
    updateShapeStyle(shape, info);
    return shape;
}

/**
 * Update text, color, and border color of a given shape
 *
 * @param shape The shape that shall be styled
 * @param info The node info required for the styling
 */
export function updateShapeStyle(shape: dia.Element, info: NodeInfo): void {
    // Get the right colors (respecting the given priority)
    const color = info.color ?? info.labelColor ?? DEFAULT_COLOR;
    const borderColor = info.borderColor ?? info.labelColor ?? DEFAULT_COLOR;

    // Update the text
    shape.attr("label/text", info.name ?? "");
    shape.attr("label/fill", info.shape === NodeShapes.TEXT ? "#333" : getFontColor(color));

    // Update the body
    if (info.shape !== NodeShapes.TEXT) {
        shape.attr("body/fill", color);
        shape.attr("body/stroke", borderColor);
    }

    // Update the top for cylinders
    if (info.shape === NodeShapes.CYLINDER) {
        shape.attr("top/fill", color);
        shape.attr("top/stroke", borderColor);
    }
}

/**
 * Create a node drag image with the right shape
 *
 * @param drag The node drag event
 * @param scale The scale of the paper
 */
export function createDragNode(drag: NodeDrag, scale: number): void {
    // Create the ghost-element
    const ghostElement = document.createElement("div");
    ghostElement.innerHTML = drag.name;
    document.body.appendChild(ghostElement);

    // Style the ghost element
    ghostElement.style.fontSize = `${20 * scale}px`;
    ghostElement.style.position = "absolute";
    ghostElement.style.top = "-200px";
    ghostElement.style.left = "-200px";
    ghostElement.style.color = getFontColor(drag.color ?? drag.labelColor ?? DEFAULT_COLOR);
    ghostElement.style.fontWeight = "bold";

    // Apply specific styles
    switch (drag.shape) {
        case NodeShapes.TEXT:
            break;
        case NodeShapes.CIRCLE:
            styleCircle(ghostElement, drag, scale);
            break;
        case NodeShapes.DIAMOND:
            styleDiamond(ghostElement, drag, scale);
            break;
        case NodeShapes.CYLINDER:
            styleCylinder(ghostElement, drag, scale);
            break;
        default:
            styleRectangle(ghostElement, drag, scale);
    }

    // Set ghost image for dragging
    document.body.appendChild(ghostElement);
    drag.evt.dataTransfer?.setDragImage(ghostElement, 0, 0);

    // Remove ghost-element from the body
    setTimeout(() => document.body.removeChild(ghostElement), 0);
}

/**
 * The generally used stroke width
 */
const strokeWidth = "2px";
const borderWidth = 2;

/**
 * The default label style
 */
const label = {
    ref: "body",
    fontSize: "20px",
    textAnchor: "middle",
    textVerticalAnchor: "middle",
    refX: "50%",
    refY: "50%",
    class: "node-text",
};

/**
 * Create and style a circle shape
 */
function getRectangleShape(): dia.Element {
    const shape = new shapes.standard.Rectangle();
    shape.attr({
        label,
        body: {
            ref: "label",
            strokeWidth,
            rx: 4,
            ry: 4,
            refWidth2: 32,
            refHeight2: 16,
            class: "node-body",
        },
    });
    return shape;
}

/**
 * Style the ghost element as a rectangle
 */
function styleRectangle(ghostElement: HTMLElement, drag: NodeDrag, scale: number): void {
    ghostElement.style.background = drag.color ?? drag.labelColor ?? DEFAULT_COLOR;
    ghostElement.style.borderRadius = `${4 * scale}px`;
    ghostElement.style.width = "fit-content";
    ghostElement.style.height = "fit-content";
    ghostElement.style.padding = `${7 * scale}px ${16 * scale}px`;
    ghostElement.style.border = `${borderWidth * scale}px solid ${drag.borderColor}`;
}

/**
 * Create and style a text shape
 */
function getTextShape(): dia.Element {
    const shape = new shapes.standard.Rectangle();
    shape.attr({
        label,
        body: {
            ref: "label",
            // Use completely transparent color, so that highlighting works correctly
            fill: "#00000000",
            strokeWidth: 0,
            class: "node-body",
        },
    });
    return shape;
}

/**
 * Create and style a circle shape
 */
function getCircleShape(): dia.Element {
    const shape = new shapes.standard.Ellipse();
    shape.attr({
        label,
        body: {
            strokeWidth,
            class: "node",
        },
    });
    shape.resize(100, 100);
    return shape;
}

/**
 * Style the ghost element as a circle
 */
function styleCircle(ghostElement: HTMLElement, drag: NodeDrag, scale: number): void {
    ghostElement.style.background = drag.color ?? drag.labelColor ?? DEFAULT_COLOR;
    ghostElement.style.borderRadius = `${50 * scale}px`;
    ghostElement.style.width = `${100 * scale}px`;
    ghostElement.style.height = `${100 * scale}px`;
    ghostElement.style.display = `flex`;
    ghostElement.style.justifyContent = `center`;
    ghostElement.style.alignItems = `center`;
    ghostElement.style.border = `${borderWidth * scale}px solid ${drag.borderColor}`;
}

/**
 * Create and style a diamond shape
 */
function getDiamondShape(): dia.Element {
    const shape = new shapes.standard.Polygon();
    shape.attr({
        label,
        body: {
            strokeWidth,
            refPoints: "0,10 10,0 20,10 10,20",
            class: "node-body",
        },
    });
    shape.resize(100, 100);
    return shape;
}

/**
 * Style the ghost element as a diamond
 * (too complex => border preview)
 */
function styleDiamond(ghostElement: HTMLElement, drag: NodeDrag, scale: number): void {
    ghostElement.innerHTML = "";
    ghostElement.style.width = `${100 * scale}px`;
    ghostElement.style.height = `${100 * scale}px`;
    ghostElement.style.border = `${4 * scale}px solid #333`;
}

/**
 * Create and style a cylinder shape
 */
function getCylinderShape(): dia.Element {
    const shape = new shapes.standard.Cylinder();
    shape.resize(100, 150);
    shape.attr({
        label,
        top: {
            strokeWidth,
        },
        body: {
            refPoints: "0,10 10,0 20,10 10,20",
            class: "node-body",
            strokeWidth,
        },
    });
    shape.topRy("10%");
    return shape;
}

/**
 * Style the ghost element as a cylinder
 * (too complex => border preview)
 */
function styleCylinder(ghostElement: HTMLElement, drag: NodeDrag, scale: number): void {
    ghostElement.innerHTML = "";
    ghostElement.style.width = `${100 * scale}px`;
    ghostElement.style.height = `${150 * scale}px`;
    ghostElement.style.border = `${4 * scale}px solid #333`;
}
