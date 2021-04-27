import { dia, shapes } from "jointjs";
import { getFontColor } from "@/utility";
import { NodeInfo } from "@/modules/editor/modules/graph-editor/controls/nodes/models/NodeInfo";
import { NodeDrag } from "@/shared/NodeDrag";

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
export function parseNodeShape(info: NodeInfo): dia.Element {
    switch (info.shape) {
        case NodeShapes.TEXT:
            return getTextShape(info);
        case NodeShapes.CIRCLE:
            return getCircleShape(info);
        case NodeShapes.DIAMOND:
            return getDiamondShape(info);
        case NodeShapes.CYLINDER:
            return getCylinderShape(info);
        default:
            return getRectangleShape(info);
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
    ghostElement.style.color = getFontColor(drag.color);
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

/**
 * The label style
 */
function getLabelStyle(info: NodeInfo) {
    return {
        ref: "body",
        fontSize: "20px",
        text: info.name,
        textAnchor: "middle",
        textVerticalAnchor: "middle",
        refX: "50%",
        refY: "50%",
        fill: getFontColor(info.color),
        class: "node-text",
    };
}

/**
 * Create and style a circle shape
 */
function getRectangleShape(info: NodeInfo): dia.Element {
    const shape = new shapes.standard.Rectangle();
    shape.attr({
        label: getLabelStyle(info),
        body: {
            ref: "label",
            fill: info.color,
            strokeWidth,
            stroke: info.borderColor,
            rx: 4,
            ry: 4,
            refWidth: 32,
            refHeight: 16,
            class: "node-body",
        },
    });
    return shape;
}

/**
 * Style the ghost element as a rectangle
 */
function styleRectangle(ghostElement: HTMLElement, drag: NodeDrag, scale: number): void {
    ghostElement.style.background = drag.color;
    ghostElement.style.borderRadius = `${4 * scale}px`;
    ghostElement.style.width = "fit-content";
    ghostElement.style.height = "fit-content";
    ghostElement.style.padding = `${7 * scale}px ${16 * scale}px`;
}

/**
 * Create and style a text shape
 */
function getTextShape(info: NodeInfo): dia.Element {
    const shape = new shapes.standard.Rectangle();
    shape.attr({
        label: getLabelStyle(info),
        body: {
            ref: "label",
            fill: "none",
            strokeWidth: 0,
            class: "node-body",
        },
    });
    return shape;
}

/**
 * Create and style a circle shape
 */
function getCircleShape(info: NodeInfo): dia.Element {
    const shape = new shapes.standard.Circle();
    shape.attr({
        label: getLabelStyle(info),
        body: {
            fill: info.color,
            stroke: info.borderColor,
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
    ghostElement.style.background = drag.color;
    ghostElement.style.borderRadius = `${50 * scale}px`;
    ghostElement.style.width = `${100 * scale}px`;
    ghostElement.style.height = `${100 * scale}px`;
    ghostElement.style.display = `flex`;
    ghostElement.style.justifyContent = `center`;
    ghostElement.style.alignItems = `center`;
}

/**
 * Create and style a diamond shape
 */
function getDiamondShape(info: NodeInfo): dia.Element {
    const shape = new shapes.standard.Polygon();
    shape.attr({
        label: getLabelStyle(info),
        body: {
            fill: info.color,
            stroke: info.borderColor,
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
function getCylinderShape(info: NodeInfo): dia.Element {
    const shape = new shapes.standard.Cylinder();
    shape.resize(100, 150);
    shape.attr({
        label: getLabelStyle(info),
        top: {
            stroke: info.borderColor,
            strokeWidth,
            fill: info.color,
        },
        body: {
            refPoints: "0,10 10,0 20,10 10,20",
            class: "node-body",
            fill: info.color,
            stroke: info.borderColor,
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
