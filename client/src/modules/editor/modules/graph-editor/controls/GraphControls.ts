import { MoveNodeCommand } from "@/modules/editor/modules/graph-editor/controls/nodes/commands/MoveNodeCommand";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { dia } from "jointjs";
import { BendRelationCommand } from "@/modules/editor/modules/graph-editor/controls/relations/commands/BendRelationCommand";
import { RelationModeType } from "@/modules/editor/modules/graph-editor/controls/relations/models/RelationModeType";

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
     * Constructor
     *
     * @param graphHandler The graph handler object
     */
    constructor(private graphHandler: GraphHandler) {}

    /**
     * Select node in the graph and display it in the inspector
     *
     * @param elementView The view of the node to select
     */
    public async selectNode(elementView: dia.ElementView): Promise<void> {
        // Only select nodes outside of relation mode
        if (!this.graphHandler.relationMode.active) {
            this.graphHandler.graph.selectElement(elementView);
            this.graphHandler.store.commit("editor/setSelectedElement", elementView.model);

            // Set the currently selected node for inspector
            const node = this.graphHandler.nodes.getByJointId(elementView.model.id);
            await this.graphHandler.store.dispatch("inspector/selectNode", node?.reference.uuid);
        }
    }

    /**
     * Select relation in the graph and display it in the inspector
     *
     * @param linkView The view of the link to select
     */
    public async selectRelation(linkView: dia.LinkView): Promise<void> {
        // Only select relations outside of relation mode
        if (!this.graphHandler.relationMode.active) {
            this.graphHandler.graph.selectElement(linkView);
            this.graphHandler.store.commit("editor/setSelectedElement", undefined);

            // Set the currently selected relation for inspector
            const relation = this.graphHandler.relations.getByJointId(linkView.model.id);
            await this.graphHandler.store.dispatch("inspector/selectRelation", relation?.uuid);
        }
    }

    /**
     * Reset all selection in the graph
     */
    public resetSelection(): void {
        this.graphHandler.graph.deselectElements();
        this.graphHandler.store.commit("editor/setSelectedElement", undefined);

        // Reset inspector selection
        this.graphHandler.store.commit("inspector/resetSelection");
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
}
