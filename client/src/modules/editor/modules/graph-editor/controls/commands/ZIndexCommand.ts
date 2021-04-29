import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { dia } from "jointjs";

/**
 * Command to change the z index of an element
 */
export class ZIndexCommand implements ICommand {
    /**
     * True if the z index really changes when executing this command
     */
    public readonly zIndexChanges: boolean;
    /**
     * Constructor
     *
     * @param graphHandler The graph handler instance
     * @param cell The cell to change the z index of
     * @param bringToFront True if it should be brought to the front, false if to the back
     */
    constructor(
        private readonly graphHandler: GraphHandler,
        private readonly cell: dia.Cell,
        private readonly bringToFront = false,
    ) {
        this.zIndexChanges = this.checkZIndexChange();
    }

    /**
     * The redo action to change the z index
     */
    redo(): void {
        if (this.bringToFront) this.toFront();
        else this.toBack();
    }

    /**
     * The undo action to change the z index back
     */
    undo(): void {
        if (this.bringToFront) this.toBack();
        else this.toFront();
    }

    /**
     * Bring the cell to the front
     */
    private toFront(): void {
        this.cell.toFront();
    }

    /**
     * Bring the cell to the back
     */
    private toBack(): void {
        this.cell.toBack();
    }

    /**
     * Calculate if z index changes when executing this command
     */
    private checkZIndexChange(): boolean {
        if (this.bringToFront) return this.graphHandler.graph.graph.maxZIndex() !== this.cell.get("z");
        else return this.graphHandler.graph.graph.minZIndex() !== this.cell.get("z");
    }
}
