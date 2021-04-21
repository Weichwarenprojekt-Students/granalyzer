import { dia, g, shapes } from "jointjs";
import { JointGraph } from "@/shared/JointGraph";
import { Store } from "vuex";
import { RootState } from "@/store";

/**
 * Provides key functionality for placing nodes and relations
 */
export class RelationUtils {
    /**
     * Reference to a new visual relation while it's being drawn
     */
    private mouseLink?: dia.Link;

    /**
     * True if mouse has been moved
     */
    private mouseMoved = false;

    /**
     * Constructor
     *
     * @param graph Graph to place nodes/relations into
     * @param store Root Store
     */
    constructor(private graph: JointGraph, private store: Store<RootState>) {
        this.registerNodeInteraction();
    }

    /**
     * Mousemove callback
     */
    // eslint-disable-next-line
    public mousemove(event: any): void {
        if (this.mouseLink && this.mouseMoved) {
            // During drawing of new visual relation, connect the new relation target to the mouse position
            requestAnimationFrame(() => {
                if (this.mouseLink) {
                    const sourcePoint = this.mouseLink.getSourcePoint();
                    const targetPoint = this.graph.paper.clientToLocalPoint(event.clientX, event.clientY);

                    // Calculate unit vector of connection between source and mouse point
                    const unitDirection = targetPoint.difference(sourcePoint).normalize(1);

                    // Set new target to mouse position, but with a distance of a few pixel so that click events
                    // aren't registered on the new link of the visual relation, but on other elements
                    this.mouseLink.target(targetPoint.difference(unitDirection.scale(10, 10)));
                }
            });
        } else if (this.mouseLink && !this.mouseMoved) {
            if (!this.mouseMoved) RelationUtils.styleLink(this.mouseLink);
            this.mouseMoved = true;
        }
    }

    /**
     * Listen for node move events
     */
    private registerNodeInteraction(): void {
        this.graph.paper.on("element:pointerclick", (cellView: dia.ElementView, evt, x, y) => {
            if (!this.mouseLink) this.mouseLink = this.beginDrawingVisualRelation(cellView.model, new g.Point(x, y));
            else {
                this.mouseLink.target(cellView.model);

                const sourceId = this.mouseLink.source().id;
                const targetId = this.mouseLink.target().id;

                if (sourceId && targetId && sourceId !== targetId)
                    this.store.commit("inventory/newRelation", { sourceId, targetId });

                this.mousemove(evt);
                this.mouseMoved = false;

                this.mouseLink.remove();
                this.mouseLink = undefined;
            }
        });

        // Interrupt drawing a new visual relation
        this.graph.paper.on("blank:pointerclick", () => {
            if (this.mouseLink) {
                this.mouseLink.remove();
                this.mouseLink = undefined;
            }
        });
    }

    /**
     * Begin drawing a visual relation
     * @param source Source element
     * @param currentPoint The current point at which to start drawing the target of the relation
     */
    private beginDrawingVisualRelation(source: dia.Element, currentPoint: g.Point): dia.Link {
        this.mouseMoved = false;

        // Create the link
        const link = new shapes.standard.Link();
        // No target at creation, so it doesn't block the double click event
        link.source(source);
        link.target(currentPoint.translate(10, 10));

        // Hide relation before first movement
        link.attr({
            rect: { fill: "none" },
            line: { stroke: "none" },
        });
        link.connector("rounded", { radius: 0 });

        // Add the relation to the graph and to the other links
        link.addTo(this.graph.graph);

        return link;
    }

    /**
     * Style the link and make it visible in the graph
     */
    private static styleLink(link: shapes.standard.Link) {
        link.attr({
            line: {
                strokeWidth: 4,
            },
        });
        link.connector("rounded", { radius: 20 });

        // Set color of the relation to be a visual relation
        link.attr({
            rect: { fill: "#0000FF" },
            line: { stroke: "#0000FF" },
        });
    }
}
