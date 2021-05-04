import { MoveNodeCommand } from "@/modules/editor/modules/graph-editor/controls/nodes/commands/MoveNodeCommand";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { dia, g, util } from "jointjs";
import { BendRelationCommand } from "@/modules/editor/modules/graph-editor/controls/relations/commands/BendRelationCommand";
import { RelationModeType } from "@/modules/editor/modules/graph-editor/controls/relations/models/RelationModeType";
import { ResizeControls } from "@/modules/editor/modules/graph-editor/controls/nodes/ResizeControls";
import Rect = g.Rect;

export class GraphControls {
    /**
     * Move node command that is saved between events, before it is possibly added to the undo/redo stack
     * @private
     */
    private moveCommand?: MoveNodeCommand;

    /**
     * Bend relation command that is saved between events, before it is possibly added to the undo/redo stack
     * @private
     */
    private bendCommand?: BendRelationCommand;

    /**
     * Controller for resizing nodes
     */
    public readonly resizeControls: ResizeControls;

    /**
     * Constructor
     *
     * @param graphHandler The graph handler object
     */
    constructor(private graphHandler: GraphHandler) {
        this.resizeControls = new ResizeControls(graphHandler);
    }

    /**
     * Select node in the graph and display it in the inspector
     *
     * @param elementView The view of the node to select
     */
    public async selectNode(elementView: dia.ElementView): Promise<void> {
        // Only select existing nodes
        if (!this.graphHandler.nodes.getByJointId(elementView.model.id)) return;

        // Only select nodes outside of relation mode
        if (!this.graphHandler.relationMode.active) {
            this.graphHandler.graph.selectElement(elementView);

            // Activate resizing handles
            this.resizeControls.activate(elementView);

            // Set the currently selected node for inspector
            const node = this.graphHandler.nodes.getByJointId(elementView.model.id);
            this.graphHandler.store.commit("editor/setSelectedElement", node);
            await this.graphHandler.store.dispatch("inspector/selectNode", {
                uuid: node?.reference.uuid,
                includeDefaults: true,
            });

            // Remove selection from overview list
            this.graphHandler.store.commit("editor/setSelectedNode", undefined);

            // Load amount of related nodes to display in toolbar
            await this.graphHandler.store.dispatch("editor/updateRelatedNodesCount", node);
        }
    }

    /**
     * Select relation in the graph and display it in the inspector
     *
     * @param linkView The view of the link to select
     */
    public async selectRelation(linkView: dia.LinkView): Promise<void> {
        // Deactivate resizing handles
        this.resizeControls.deactivate();

        // Only select relations outside of relation mode
        if (!this.graphHandler.relationMode.active) {
            this.graphHandler.graph.selectElement(linkView);

            // Set the currently selected relation for inspector
            const relation = this.graphHandler.relations.getByJointId(linkView.model.id);
            this.graphHandler.store.commit("editor/setSelectedElement", relation);
            await this.graphHandler.store.dispatch("inspector/selectRelation", {
                uuid: relation?.uuid,
                includeDefaults: true,
            });

            // Remove selection from overview list
            this.graphHandler.store.commit("editor/setSelectedNode", undefined);

            // Set Related nodes amount to 0
            await this.graphHandler.store.dispatch("editor/updateRelatedNodesCount");
        }
    }

    /**
     * Reset all selection in the graph
     */
    public resetSelection(): void {
        this.graphHandler.graph.deselectElements();
        this.graphHandler.store.commit("editor/setSelectedElement", undefined);

        // Remove selection from overview list
        this.graphHandler.store.commit("editor/setSelectedNode", undefined);

        // Deactivate resizing handles
        this.resizeControls.deactivate();

        // Reset inspector selection
        this.graphHandler.store.commit("inspector/resetSelection");

        requestAnimationFrame(async () => {
            // Set Related nodes amount to 0
            await this.graphHandler.store.dispatch("editor/updateRelatedNodesCount");
        });
    }

    /**
     * Start moving a node in the graph
     *
     * @param elementView The view of the node that was moved
     */
    public startNodeMovement(elementView: dia.ElementView): void {
        const node = this.graphHandler.nodes.getByJointId(elementView.model.id);

        // Prepare MoveNodeCommand for the stop of the movement
        if (node) this.moveCommand = new MoveNodeCommand(this.graphHandler, node);
        else this.moveCommand = undefined;
    }

    /**
     * Stop moving a node in the graph
     */
    public async stopNodeMovement(): Promise<void> {
        if (this.moveCommand && this.moveCommand.positionChanged()) {
            // Only add the MoveNodeCommand to the undo/redo stack if the position has actually changed
            await this.graphHandler.store.dispatch("editor/addCommand", this.moveCommand);
        }
        this.moveCommand = undefined;
    }

    /**
     * Start bending a relation
     *
     * @param linkView The view of the link that was bended
     */
    public startBendingRelation(linkView: dia.LinkView): void {
        const relation = this.graphHandler.relations.getByJointId(linkView.model.id);
        if (relation) this.bendCommand = new BendRelationCommand(this.graphHandler, relation);
        else this.bendCommand = undefined;
    }

    /**
     * Stop bending a relation
     */
    public async stopBendingRelation(): Promise<void> {
        // Only add the BendRelationCommand to the undo/redo stack if the vertices have actually changed
        if (this.bendCommand && this.bendCommand.verticesHaveChanged()) {
            // Use local variable for bend command, so that this.bendCommand can be reset before dispatch is awaited
            const cmd = this.bendCommand;
            this.bendCommand = undefined;

            await this.graphHandler.store.dispatch("editor/addCommand", cmd);
        } else this.bendCommand = undefined;
    }

    /**
     * Show link tools of a relation
     *
     * @param linkView The view of the link to show the link tools of
     */
    public showLinkTools(linkView: dia.LinkView): void {
        // Only show tools outside of relation mode or always for visual relations
        if (
            !this.graphHandler.relationMode.active ||
            this.graphHandler.relations.getByJointId(linkView.model.id)?.relationModeType === RelationModeType.VISUAL
        ) {
            linkView.showTools();
        }
    }

    /**
     * Hide link tools of a relation
     *
     * @param linkView The view of the link to hide the link tools of
     */
    public hideLinkTools(linkView: dia.LinkView): void {
        linkView.hideTools();
    }

    /**
     * Centers the content of the graph
     */
    public centerContent(): void {
        const nodesController = this.graphHandler.nodes;
        if (this.graphHandler.graph.graph.getElements().length === 0) return;

        // Get bounding box
        const xRange: { min: number; max: number } = { min: Number.MAX_VALUE, max: -Number.MAX_VALUE };
        const yRange: { min: number; max: number } = { min: Number.MAX_VALUE, max: -Number.MAX_VALUE };

        for (const node of nodesController) {
            const top = node.info.y;
            const bottom = top + node.info.size.height;
            const left = node.info.x;
            const right = left + node.info.size.width;

            if (top < yRange.min) yRange.min = top;
            if (bottom > yRange.max) yRange.max = bottom;
            if (left < xRange.min) xRange.min = left;
            if (right > xRange.max) xRange.max = right;
        }

        const bBox = {
            x: xRange.min,
            y: yRange.min,
            width: xRange.max - xRange.min,
            height: yRange.max - yRange.min,
        };

        // Scale content to fit bounding box
        this.fitContent(this.graphHandler.graph.paper.localToPaperRect(bBox), 0);

        // Center the graph to the midpoint
        this.graphHandler.graph.centerGraph({ x: bBox.x + bBox.width / 2, y: bBox.y + bBox.height / 2 });

        // Extra margin
        const area = this.graphHandler.graph.paper.getArea();
        const xMiddle = area.x + area.width / 2;
        const yMiddle = area.y + area.height / 2;
        this.graphHandler.graph.zoom(-1, xMiddle, yMiddle);
        while (this.graphHandler.graph.paper.scale().sx > 1.5) this.graphHandler.graph.zoom(-1, xMiddle, yMiddle);
    }

    /**
     * Scales the content of the given bounding box to fit the current client graph
     *
     * @param bBox Box that contains all the content that should be scaled to the client window
     * @param padding Extra padding in px
     */
    fitContent(bBox: { x: number; y: number; width: number; height: number }, padding: number): void {
        const contentLocalOrigin = this.graphHandler.graph.paper.paperToLocalPoint(bBox);
        if (!bBox.width || !bBox.height) return;

        // Box that content should be scaled into
        const currentTranslate = this.graphHandler.graph.paper.translate();
        const computedSize = this.graphHandler.graph.paper.getComputedSize();
        let fittingBBox = {
            x: currentTranslate.tx,
            y: currentTranslate.ty,
            width: computedSize.width,
            height: computedSize.height,
        };

        // Extra padding, if specified
        const contentPadding = util.normalizeSides(padding);
        if (contentPadding.left && contentPadding.right && contentPadding.bottom && contentPadding.top)
            fittingBBox = new Rect(fittingBBox).moveAndExpand(<g.PlainRect>{
                x: contentPadding.left,
                y: contentPadding.top,
                width: -contentPadding.left - contentPadding.right,
                height: -contentPadding.top - contentPadding.bottom,
            });

        // Preserve aspect ratio & set min/max boundaries
        const currentScale = this.graphHandler.graph.paper.scale();
        let newSx = (fittingBBox.width / bBox.width) * currentScale.sx;
        let newSy = (fittingBBox.height / bBox.height) * currentScale.sy;
        newSx = Math.min(Number.MAX_VALUE, Math.max(0, Math.min(newSx, newSy)));
        newSy = Math.min(Number.MAX_VALUE, Math.max(0, Math.min(newSx, newSy)));

        // Adjust origin
        const origin = this.graphHandler.graph.paper.options.origin;
        if (!origin) return;
        const newOx = fittingBBox.x - contentLocalOrigin.x * newSx - origin.x;
        const newOy = fittingBBox.y - contentLocalOrigin.y * newSy - origin.y;

        // Scale and translate to fit new bounding box
        this.graphHandler.graph.paper.scale(newSx, newSy);
        this.graphHandler.graph.paper.translate(newOx, newOy);
    }
}
