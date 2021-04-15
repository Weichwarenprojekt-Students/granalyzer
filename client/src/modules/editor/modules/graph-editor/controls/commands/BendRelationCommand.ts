import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";
import { GraphHandler } from "../GraphHandler";
import { dia } from "jointjs";

export class BendRelationCommand implements ICommand {
    /**
     * Original vertices of the link
     */
    private readonly originalVertices: dia.Link.Vertex[];

    /**
     * The new vertices of the link
     */
    private newVertices?: dia.Link.Vertex[];

    /**
     * Constructor
     */
    constructor(private graphHandler: GraphHandler, private diagElement: dia.Link) {
        this.originalVertices = diagElement.vertices();
    }

    /**
     * Check if the vertices of the link have changed
     */
    public verticesHaveChanged(): boolean {
        // Get current vertices of the link
        this.newVertices = this.diagElement.vertices();

        // Use sets to filter out possible duplicate points
        const newVertexSet = new Set(this.newVertices.map((vert) => `${vert.x}@${vert.y}`));
        const origVertexSet = new Set(this.originalVertices.map((vert) => `${vert.x}@${vert.y}`));

        // Use difference of both sets to determine if the vertices have changed
        return [...origVertexSet].filter((x) => !newVertexSet.has(x)).length !== 0;
    }

    /**
     * Set the new vertices for the node
     */
    redo(): void {
        if (this.newVertices) this.diagElement.vertices(this.newVertices);
    }

    /**
     * Reset the vertices of the node
     */
    undo(): void {
        this.diagElement.vertices(this.originalVertices);
    }
}
