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

    /**
     * Constructor
     *
     * @param name Name of the relation type
     * @param attributes Attributes of the relation type
     * @param connections Possible connections of the relation type
     */
    constructor(name?: string, attributes?: Attribute[], connections?: Connection[]) {
        this.name = name || "";
        this.attributes = attributes || [];
        this.connections = connections || [];
    }
}
