import { ICommand } from "@/modules/editor/modules/graph-editor/undo-redo/commands/ICommand";
import { Node } from "@/modules/editor/modules/graph-editor/models/Node";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/GraphHandler";
import { dia } from "jointjs";

export class MoveNodeCommand implements ICommand {
    private readonly node?: Node;

    private readonly startXPos: number;
    private readonly startYPos: number;
    private stopXPos: number;
    private stopYPos: number;

    /**
     * Constructor
     */
    constructor(private graphHandler: GraphHandler, private diagElement: dia.Element) {
        this.node = graphHandler.nodes.get(diagElement);

        this.startXPos = diagElement.attributes.position.x;
        this.startYPos = diagElement.attributes.position.y;

        this.stopXPos = this.startXPos;
        this.stopYPos = this.startYPos;
    }

    /**
     * Sets the stop-position of the node
     * @param stopXPos X-Coordinate
     * @param stopYPos Y-Coordinate
     */
    public setNodeStopPos(stopXPos: number, stopYPos: number): void {
        this.stopXPos = stopXPos;
        this.stopYPos = stopYPos;
    }

    /**
     * Moves the node to the new position
     */
    redo(): void {
        if (!this.node) return;

        // Update the data record
        this.node.x = this.stopXPos;
        this.node.y = this.stopYPos;

        // Set diagram element position
        this.diagElement.position(this.stopXPos, this.stopYPos);
    }

    /**
     * Moves the node to the old position
     */
    undo(): void {
        if (!this.node) return;

        // Update the data record
        this.node.x = this.startXPos;
        this.node.y = this.startYPos;

        // Set diagram element position
        this.diagElement.position(this.startXPos, this.startYPos);
    }
}
