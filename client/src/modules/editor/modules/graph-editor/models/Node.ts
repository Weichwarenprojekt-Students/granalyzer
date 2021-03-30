import { NodeConfig } from "@antv/g6";

export class Node implements NodeConfig {
    /**
     * The id of the node
     */
    public id = "0";
    /**
     * The UUID that links this node to the actual node in
     * the customer DB
     */
    public uuid = 0;
    /**
     * The shown node
     */
    public label = "Node";
    /**
     * The x-position
     */
    public x = 0;
    /**
     * The y-position
     */
    public y = 0;

    /**
     * Index signature
     */
    [key: string]: unknown;
}
