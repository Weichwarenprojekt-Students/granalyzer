import { EdgeConfig } from "@antv/g6";

export class Edge implements EdgeConfig {
    /**
     * The source node this edge refers too
     */
    public source = "0";
    /**
     * The target node this edge refers too
     */
    public target = "0";
    /**
     * The text for the relation
     */
    public label = "Relation";

    /**
     * Index signature
     */
    [key: string]: unknown;
}
