/**
 * The data for referencing a node
 */
export interface NodeReference {
    /**
     * The uuid of the actual node (from the customer db)
     */
    uuid: string;
    /**
     * The index of the element (usually 0 if the actual db node
     * is only referenced once in the db)
     */
    index: number;
}
