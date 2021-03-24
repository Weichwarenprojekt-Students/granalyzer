import { Attribute } from "./attributes";
import { Connection } from "./connection";

export class RelationType {
    /**
     * Name of the relation
     */
    name: string;

    /**
     * Array of all attributes of the relation
     */
    attributes: Attribute[];

    /**
     * Array of all connections where the relation can be
     */
    connections: Connection[];
}
