import { dia, g } from "jointjs";

class PaperOptions implements dia.Paper.Options {
    [key: string]: unknown;
}

/**
 * Type alias for better expressing joint js UUIDs
 */
export type JointID = string | number;

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
        const config: PaperOptions = {
            el: document.getElementById(canvas),
            model: this.graph,
            width: "100%",
            height: "100%",
            gridSize: 1,
            interactive: (cellView: dia.CellView) => {
                // Disable interaction of a cell, if its disableInteraction property is true
                if (cellView.model.get("disableInteraction")) return false;
                return { labelMove: false, linkMove: false };
            },
            defaultConnector: { name: "rounded", args: { radius: 10 } },
        };
        this.paper = new dia.Paper(config);
        this.paper.translate(500, 200);
        this.paper.scale(0.6, 0.6);
        this.registerEvents();
    }

    /**
     * Centers the graph
     */
    public centerGraph(newMiddlePoint?: { x?: number; y?: number }): void {
        const area = this.paper.getArea();
        const xMiddle = area.x + area.width / 2;
        const yMiddle = area.y + area.height / 2;

        const translate = this.paper.translate();
        const scale = this.paper.scale();

        if (!newMiddlePoint) this.paper.translate(translate.tx + xMiddle * scale.sx, translate.ty + yMiddle * scale.sy);
        else
            this.paper.translate(
                translate.tx + (newMiddlePoint.x ? (xMiddle - newMiddlePoint.x) * scale.sx : 0),
                translate.ty + (newMiddlePoint.y ? (yMiddle - newMiddlePoint.y) * scale.sy : 0),
            );
    }

    /**
     * Centers the content of the graph
     */
    public centerContent(): void {
        const elements = this.graph.getElements();
        if (elements.length === 0) return;

        this.paper.scaleContentToFit();

        // Get range of y values
        const yRange: { min: number; max: number } = { min: Number.MAX_VALUE, max: Number.MIN_VALUE };

        elements
            .map((el) => document.querySelector(`[model-id="${el.id}"]`)?.getBoundingClientRect())
            .forEach((element: DOMRect | undefined) => {
                if (!element) return;
                const y = element.y;
                if (y > yRange.max) yRange.max = y;
                if (y < yRange.min) yRange.min = y;
            });

        // Translate graph to fit the bounding box
        const bBoxMiddle = this.paper.clientToLocalPoint({
            x: 0,
            y: (yRange.min + yRange.max) / 2,
        });
        this.centerGraph({ x: 0, y: bBoxMiddle.y });

        // Extra margin
        const area = this.paper.getArea();
        const xMiddle = area.x + area.width / 2;
        const yMiddle = area.y + area.height / 2;
        this.zoom(-1, xMiddle, yMiddle);
    }

    /**
     * Move the diagram paper
     */
    // eslint-disable-next-line
    public mousemove(event: any): void {
        if (!this.eventData) return;
        requestAnimationFrame(() => {
            if (!this.eventData) return;
            const tx = event.pageX - this.eventData.x;
            const ty = event.pageY - this.eventData.y;
            if (this.panning) this.paper.translate(tx + this.eventData.px, ty + this.eventData.py);
        });
    }

    /**
     * Select one cell in the graph
     * @param cellView The cell to select
     * @param isLink True if the element is a link
     */
    public selectElement(cellView: dia.CellView | dia.LinkView, isLink = false): void {
        this.deselectElements();
        if (!isLink)
            cellView.model.attr({
                body: {
                    strokeWidth: 4,
                },
            });
        else if (cellView instanceof dia.LinkView)
            cellView.model.label(0, {
                attrs: {
                    rect: {
                        strokeWidth: 4,
                    },
                },
            });
    }

    /**
     * Set the interactivity of all nodes
     * @param value True if interactivity should be enabled
     */
    public setInteractivity(value: boolean): void {
        for (const element of this.graph.getElements()) element.set("disableInteraction", !value);
    }

    /**
     * Reset the focus style of all cells
     * @private
     */
    public deselectElements(): void {
        for (const element of this.graph.getElements())
            element.attr({
                body: {
                    strokeWidth: 0,
                },
            });

        for (const link of this.graph.getLinks())
            link.label(0, {
                attrs: {
                    rect: {
                        strokeWidth: 0,
                    },
                },
            });
    }

    /**
     * Takes care of overlapping relations
     * From: https://resources.jointjs.com/tutorial/multiple-links-between-elements
     *
     * @param element Element which overlapping relations should be rearranged
     * @param rearrangeAll False, if the rearrangement does not apply on links which were already positioned
     */
    public rearrangeOverlappingRelations(element: dia.Element, rearrangeAll = true): void {
        const connectedLinks = this.graph.getConnectedLinks(element);

        // Exit if node has no relation
        if (!connectedLinks[0]) return;

        // Get unique neighbor nodes
        const uniqueNeighborIds: Set<string> = new Set(
            connectedLinks.map((link) => {
                const sourceId = link.get("source").id;
                return sourceId !== element.id ? sourceId : link.get("target").id;
            }),
        );

        // Adjust siblings for each target
        uniqueNeighborIds.forEach((neighborId) => {
            this.adjustSiblingRelations(neighborId, element.id.toString(), rearrangeAll);
        });
    }

    /**
     * Adjust the overlapping relations for one links siblings
     *
     * @param startId Source of the overlapping relations
     * @param endId Target of the overlapping relations
     * @param rearrangeAll False, if the rearrangement does not apply on links which were already positioned
     */
    private adjustSiblingRelations(startId: string, endId: string, rearrangeAll = true) {
        // Exit if not both endpoints of the relation are set
        if (!startId || !endId) return;

        // identify link siblings
        const siblings = this.getSiblingsOfLink(startId, endId);

        // Check if there are overlapping links to rearrange
        if (!JointGraph.hasOverlappingSiblings(siblings, rearrangeAll)) return;

        // Prevent overlapping if more than one relation
        if (siblings.length > 1) {
            this.rearrangeLinks(startId, endId, siblings, rearrangeAll);
        }
    }

    /**
     * Checks if there are overlapping relations in the list of siblings
     * Depends on whether already positioned nodes should be rearranged to
     *
     * @param siblings
     * @param rearrangeAll
     * @private
     */
    private static hasOverlappingSiblings(siblings: dia.Link[], rearrangeAll: boolean) {
        // Abort if less than 2 links
        if (siblings.length <= 1) return false;
        // Filter siblings without vertices
        siblings = siblings.filter((sibling) => sibling.vertices().length === 0);

        return siblings.length > 1 || rearrangeAll;
    }

    /**
     * Get all siblings of the link specified by the ids of both node endpoints
     *
     * @param startId
     * @param endId
     * @private
     */
    private getSiblingsOfLink(startId: string, endId: string) {
        return this.graph.getLinks().filter((sibling) => {
            const siblingStartId = sibling.source().id;
            const siblingEndId = sibling.target().id;

            // if source and target are the same
            // or if source and target are reversed
            return (
                (siblingStartId === startId && siblingEndId === endId) ||
                (siblingStartId === endId && siblingEndId === startId)
            );
        });
    }

    /**
     * Rearrange the links
     *
     * @param startId The id of the start node
     * @param endId The id of the end node
     * @param siblings A list of all sibling links
     * @param rearrangeAll True if all should be arranged
     * @private
     */
    private rearrangeLinks(startId: string, endId: string, siblings: dia.Link[], rearrangeAll: boolean) {
        // Get the middle point of the link
        const sourceCenter = this.graph.getCell(startId).getBBox().center();
        const targetCenter = this.graph.getCell(endId).getBBox().center();
        const midPoint = new g.Line(sourceCenter, targetCenter).midpoint();

        // Get the angle between start and end node
        const theta = sourceCenter.theta(targetCenter);

        // The maximum distance between two sibling links
        const GAP = 120;
        let i = 0;

        siblings
            .filter((sibling) => rearrangeAll || !(sibling.vertices().length !== 0))
            .forEach((sibling) => {
                // Ignore already moved relations if flag is false

                // Contains calculated vertices
                let vertex = new g.Point(0, 0);

                let atCorrectPosition = false;
                while (!atCorrectPosition) {
                    // Offset values like 0, 20, 20, 40, 40, 60, 60 ...
                    let offset = GAP * Math.ceil(i / 2);

                    // Alternate the direction in which the relation is moved (right/left)
                    const sign = i % 2 ? 1 : -1;

                    // Keep even numbers of relations symmetric
                    if (siblings.length % 2 === 0) {
                        offset -= (GAP / 2) * sign;
                    }

                    // Make reverse links count the same as non-reverse
                    const reverse = theta < 180 ? 1 : -1;

                    // Apply the shifted relation
                    const angle = g.toRad(theta + sign * reverse * 90);
                    vertex = g.Point.fromPolar(offset, angle, midPoint);

                    atCorrectPosition = true;
                    i++;

                    // Check if there is a relation at the same position
                    siblings
                        .map((s) => s.vertices())
                        .filter((v) => v.length != 0)
                        .forEach((v) => {
                            if (vertex.distance(new g.Point(v[0])) < 10) {
                                atCorrectPosition = false;
                            }
                        });
                }

                // Replace vertices
                if (vertex && (i > 1 || siblings.length % 2 === 0)) sibling.vertices([vertex]);
            });
    }

    /**
     * Register the basic events for graph interaction
     */
    private registerEvents(): void {
        // Start panning the diagram
        this.paper.on("blank:pointerdown", (evt) => {
            const offset = this.paper.translate();
            this.eventData = { x: evt.pageX, y: evt.pageY, px: offset.tx, py: offset.ty };
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
        if ((nextScale < 0.1 && nextScale < oldScale) || nextScale > 10) return;

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
}
