import { Node } from "./Node";
import { Edge } from "./Edge";

export class Diagram {
    /**
     * The model for a diagram
     *
     * @param nodes
     * @param edges
     */
    constructor(public nodes: Array<Node>, public edges: Array<Edge>) {}
}
