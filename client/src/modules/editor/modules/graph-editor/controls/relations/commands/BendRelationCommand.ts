import { ICommand } from "@/modules/editor/modules/graph-editor/controls/models/ICommand";
import { GraphHandler } from "../../GraphHandler";
import { dia } from "jointjs";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/relations/Relation";
import Anchors from "@/modules/editor/modules/graph-editor/controls/relations/models/Anchors";

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
     * Original anchors of the link
     * @private
     */
    private readonly originalAnchors: Anchors;

    /**
     * The new anchors of the link
     * @private
     */
    private newAnchors?: Anchors;

    /**
     * Constructor
     *
     * @param graphHandler The current graph handler
     * @param relation The relation that is bended
     */
    constructor(private graphHandler: GraphHandler, private relation: Relation) {
        this.originalVertices = relation.vertices;
        this.originalAnchors = relation.anchors;
    }

    /**
     * Check if the vertices of the link have changed
     */
    public verticesHaveChanged(): boolean {
        // Get current vertices and anchors of the link
        this.newVertices = this.relation.vertices;
        this.newAnchors = this.relation.anchors;

        // Use sets to filter out possible duplicate points
        const newVertexSet = new Set(this.newVertices.map((vert) => `${vert.x}@${vert.y}`));
        const origVertexSet = new Set(this.originalVertices.map((vert) => `${vert.x}@${vert.y}`));

        // Use symmetric difference of both sets to determine if the vertices have changed
        return (
            [...origVertexSet, ...newVertexSet].filter((x) => {
                return !(newVertexSet.has(x) && origVertexSet.has(x));
            }).length !== 0
        );
    }

    /**
     * Set the new vertices and anchors for the node
     */
    redo(): void {
        if (this.newVertices) this.relation.vertices = this.newVertices;
        if (this.newAnchors) this.relation.anchors = this.newAnchors;
    }

    /**
     * Reset the vertices and anchors of the node
     */
    undo(): void {
        this.relation.vertices = this.originalVertices;
        this.relation.anchors = this.originalAnchors;
    }
}
