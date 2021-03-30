import { Node } from "./Node";
import { Edge } from "./Edge";
import { GraphData } from "@antv/g6";

export class Diagram implements GraphData {
    /**
     * The model for a diagram
     * @param nodes
     * @param edges
     */
    constructor(public nodes: Array<Node>, public edges: Array<Edge>) {}

    /**
     * Index signature
     */
    [key: string]: unknown;
}
