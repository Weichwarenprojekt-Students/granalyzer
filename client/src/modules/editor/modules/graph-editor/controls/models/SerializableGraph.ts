import { RelationInfo } from "../relations/models/RelationInfo";
import { NodeInfo } from "../nodes/models/NodeInfo";

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
