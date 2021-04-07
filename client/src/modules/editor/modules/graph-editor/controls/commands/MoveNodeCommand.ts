import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";
import { Node } from "../models/Node";
import { GraphHandler } from "../GraphHandler";
import { dia } from "jointjs";

export class MoveNodeCommand implements ICommand {
    /**
     * The node that was moved
     */
    private readonly node?: Node;

    /**
     * The initial x position
     */
    private readonly startXPos: number;

    /**
     * The initial y position
     */
    private readonly startYPos: number;

    /**
     * The final x position
     */
    private stopXPos = 0;

    /**
     * The final y position
     */
    private stopYPos = 0;

    /**
     * Constructor
     */
    constructor(private graphHandler: GraphHandler, private diagElement: dia.Element) {
        this.node = graphHandler.nodes.get(diagElement);
        this.startXPos = diagElement.attributes.position.x;
        this.startYPos = diagElement.attributes.position.y;
    }

    /**
     * Check if the node actually changed its position
     */
    public positionChanged(): boolean {
        const xChanged = this.startXPos != this.diagElement.attributes.position.x;
        const yChanged = this.startYPos != this.diagElement.attributes.position.y;
        return xChanged || yChanged;
    }

    /**
     * Set the stop-position of the node
     */
    public updateStopPosition(): void {
        this.stopXPos = this.diagElement.attributes.position.x;
        this.stopYPos = this.diagElement.attributes.position.y;
    }

    /**
     * Moves the node to the new position
     */
    redo(): void {
        if (this.node) this.diagElement.position(this.stopXPos, this.stopYPos);
    }

    /**
     * Moves the node to the old position
     */
    undo(): void {
        if (this.node) this.diagElement.position(this.startXPos, this.startYPos);
    }
}
