import { RelationInfo } from "./RelationInfo";
import { NodeInfo } from "./NodeInfo";

/**
 * The data for the whole graph
 */
export interface SerializableGraph {
    /**
     * All the nodes contained in the graph
     */
    nodes: Array<NodeInfo>;
    /**
     * All the relations contained in the graph
     */
    relations: Array<RelationInfo>;
}
