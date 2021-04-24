import { dia, g, shapes } from "jointjs";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/relations/Relation";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { Store } from "vuex";
import { RootState } from "@/store";
import { NewRelationCommand } from "@/modules/editor/modules/graph-editor/controls/relations/commands/NewRelationCommand";
import { ConnectRelationCommand } from "@/modules/editor/modules/graph-editor/controls/relations/commands/ConnectRelationCommand";
import { RelationModeType } from "@/modules/editor/modules/graph-editor/controls/relations/models/RelationModeType";

export class VisualRelationControls {
    /**
     * Reference to a new visual relation while it's being drawn
     */
    private newVisualRelation?: dia.Link;

    /**
     * Constructor
     *
     * @param graphHandler Instance of the graph handler
     * @param store Vuex store
     */
    constructor(private graphHandler: GraphHandler, private store: Store<RootState>) {}

    /**
     * @return True during drawing a relation
     */
    public get isDrawing(): boolean {
        return this.newVisualRelation != null;
    }

    /**
     * Start drawing a new visual relation
     *
     * @param elementView The ElementView of the element where to start the visual relation
     * @param evt The event
     * @param x X coordinate of the mouse
     * @param y Y coordinate of the mouse
     */
    public startDrawing(elementView: dia.ElementView, evt: dia.Event, x: number, y: number): void {
        // Abort if relation mode isn't active
        if (!this.store.state.editor?.graphEditor?.relationModeActive) return;

        // Create the link
        const link = new shapes.standard.Link();
        link.source(elementView.model);
        link.target(new g.Point(x, y));
        link.attr({
            line: {
                strokeWidth: 4,
                stroke: Relation.VISUAL_RELATION_COLOR,
            },
        });

        // Add the relation to the graph and to the other links
        link.addTo(this.graphHandler.graph.graph);

        this.newVisualRelation = link;
    }

    /**
     * End drawing the visual relation
     *
     * @param elementView The ElementView of the element where to stop drawing
     */
    public async endDrawing(elementView: dia.ElementView): Promise<void> {
        // Abort if no new relation is specified
        if (this.newVisualRelation == null) return;

        // Remove the drawn relation
        const sourceId = this.newVisualRelation.source().id;
        this.newVisualRelation.remove();
        this.newVisualRelation = undefined;

        if (sourceId == null) return;

        const source = this.graphHandler.nodes.getByJointId(sourceId);
        const target = this.graphHandler.nodes.getByJointId(elementView.model.id);

        // If source and target elements are undefined, abort
        if (source == null || target == null) return;

        // Add new visual relation between the nodes of the drawn relation
        await this.store.dispatch(
            "editor/openNewRelationDialog",
            new NewRelationCommand(this.graphHandler, source, target, RelationModeType.VISUAL),
        );
    }

    /**
     * Cancel current drawing of relation
     */
    public cancelDrawing(): void {
        this.newVisualRelation?.remove();
        this.newVisualRelation = undefined;
    }

    /**
     * Mousemove callback
     */
    // eslint-disable-next-line
    public mousemove(event: any): void {
        if (this.store.state.editor?.graphEditor?.relationModeActive && this.newVisualRelation) {
            // During drawing of new visual relation, connect the new relation target to the mouse position
            requestAnimationFrame(() => {
                if (this.newVisualRelation) {
                    const sourcePoint = this.newVisualRelation.getSourcePoint();
                    const targetPoint = this.graphHandler.graph.paper.clientToLocalPoint(event.clientX, event.clientY);

                    // Calculate unit vector of connection between source and mouse point
                    const unitDirection = targetPoint.difference(sourcePoint).normalize(1);

                    // Set new target to mouse position, but with a distance of a few pixel so that click events
                    // aren't registered on the new link of the visual relation, but on other elements
                    this.newVisualRelation.target(targetPoint.difference(unitDirection.scale(10, 10)));
                }
            });
        }
    }

    /**
     * Change the connections of a visual relation
     *
     * @param linkView The LinkView of the relation whose connection was changed
     */
    public async changeRelationConnection(linkView: dia.LinkView): Promise<void> {
        const relation = this.graphHandler.relations.getByJointId(linkView.model.id);

        // If no corresponding relation is known, abort
        if (relation == null) return;

        const sourceId = relation.jointLink.source()?.id;
        const targetId = relation.jointLink.target()?.id;

        if (sourceId === targetId) {
            // Source and target element are the same, reset the connection
            relation.jointLink.source(relation.sourceNode.jointElement);
            relation.jointLink.target(relation.targetNode.jointElement);

            return;
        }

        // If one of the endpoints is not connected to an element, don't register ConnectRelationCommand
        if (sourceId == null || targetId == null) return;

        const cmd = new ConnectRelationCommand(this.graphHandler, relation);
        if (cmd.connectionHasChanged()) await this.store.dispatch("editor/addCommand", cmd);
    }
}
