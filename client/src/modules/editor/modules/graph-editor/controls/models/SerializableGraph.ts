import { Relation } from "./Relation";
import { Node } from "./Node";

/**
 * The data for the whole graph
 */
export interface SerializableGraph {
    /**
     * All the nodes contained in the graph
     */
    nodes: Array<Node>;
    /**
     * All the relations contained in the graph
     */
    relations: Array<Relation>;
}
