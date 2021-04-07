import { dia } from "jointjs";

class GraphOptions implements dia.Paper.Options {
    // eslint-disable-next-line no-undef
    [key: string]: unknown;
}

/**
 * This class wraps some key functionality for the
 * joint graph so that it can be reused easily
 */
export class JointGraph {
    /**
     * The joint graph object
     */
    public readonly graph: dia.Graph;

    /**
     * The joint paper object
     */
    public readonly paper: dia.Paper;

    /**
     * True if the diagram is currently moved
     */
    private panning = false;

    /**
     * The event data from joint
     */
    private eventData?: { x: number; y: number; px: number; py: number };

    /**
     * Constructor
     */
    constructor(canvas: string) {
        this.graph = new dia.Graph();
        const config: GraphOptions = {
            el: document.getElementById(canvas),
            model: this.graph,
            width: "100%",
            height: "100%",
            gridSize: 1,
        };
        this.paper = new dia.Paper(config);
        this.paper.translate(500, 200);
        this.paper.scale(0.6, 0.6);
        this.registerEvents();
    }

    /**
     * Move the diagram paper
     */
    // eslint-disable-next-line
    public mousemove(event: any): void {
        if (!this.eventData) return;
        const tx = event.offsetX - this.eventData.x;
        const ty = event.offsetY - this.eventData.y;
        if (this.panning) this.paper.translate(tx + this.eventData.px, ty + this.eventData.py);
    }

    /**
     * Register the basic events for graph interaction
     */
    private registerEvents(): void {
        // Start panning the diagram
        this.paper.on("blank:pointerdown", (evt) => {
            const offset = this.paper.translate();
            this.eventData = { x: evt.offsetX, y: evt.offsetY, px: offset.tx, py: offset.ty };
            this.panning = true;
        });

        // Stop panning the diagram
        this.paper.on("blank:pointerup", () => {
            this.eventData = undefined;
            this.panning = false;
        });

        // Zoom the paper while over any element
        this.paper.on("element:mousewheel link:mousewheel cell:mousewheel", (cellView, evt, x, y, delta) =>
            this.zoom(delta, x, y),
        );

        // Zoom the paper while over blank space
        this.paper.on("blank:mousewheel", (evt, x, y, delta) => this.zoom(delta, x, y));

        // Find out if user clicked element and set element object
        this.paper.on("element:pointerdown", (cell) => {
            this.resetCellFocus();
            cell.model.attr({
                body: {
                    strokeWidth: 4,
                },
            });
        });

        // No element selected
        this.paper.on("blank:pointerdown", this.resetCellFocus);
    }

    /**
     * Zoom the diagram paper
     * https://github.com/clientIO/joint/issues/1027
     *
     * @param delta The amount the mousewheel has changed
     * @param x The x coordinate of the mousewheel event
     * @param y The y coordinate of the mousewheel event
     */
    private zoom(delta: number, x: number, y: number): void {
        // Calculate the new scale and check if it is in bounds
        const oldScale = this.paper.scale().sx;
        const nextScale = 1.1 ** delta * oldScale;
        if (nextScale < 0.1 || nextScale > 10) return;

        // Adjust the translation of the paper so that the zoom actually
        // centers with the mouse
        const currentScale = this.paper.scale().sx;
        const beta = currentScale / nextScale;
        const ax = x - x * beta;
        const ay = y - y * beta;

        const translate = this.paper.translate();
        const nextTx = translate.tx - ax * nextScale;
        const nextTy = translate.ty - ay * nextScale;

        this.paper.translate(nextTx, nextTy);
        this.paper.scale(nextScale);
    }

    /**
     * Reset the focus style of all cells
     * @private
     */
    private resetCellFocus = (): void => {
        for (const element of this.graph.getElements())
            element.attr({
                body: {
                    strokeWidth: 0,
                },
            });
    };
}
