import { RelationInfo } from "../relations/models/RelationInfo";
import { NodeInfo } from "../nodes/models/NodeInfo";
import { HeatConfig } from "@/modules/editor/modules/heat-map/models/HeatConfig";

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
    /**
     * All heat map configs
     */
    heatConfigs?: {
        [key: string]: HeatConfig;
    };
}
