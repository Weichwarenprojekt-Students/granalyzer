import { Attribute } from "./attributes";
import { Connection } from "./connection";
import { ApiProperty } from "@nestjs/swagger";

export class RelationType {
    @ApiProperty({
        required: false,
        type: "number",
        name: "id",
        description: "Id of the relation type scheme",
    })
    id?: number;

    @ApiProperty({
        required: true,
        type: "number",
        name: "id",
        description: "Id of the relation type scheme",
    })
    name: string;

    @ApiProperty({
        required: true,
        type: [Attribute],
        name: "attributes",
        description: "Array containing all attributes of the relation type scheme",
    })
    attributes: Attribute[];

    @ApiProperty({
        required: true,
        type: [Connection],
        name: "connections",
        description: "Array containing all connections of the relation type scheme",
    })
    connections: Connection[];

    /**
     * Constructor
     *
     * @param name Name of the relation type
     * @param attributes Attributes of the relation type
     * @param connections Possible connections of the relation type
     * @param id ID in the database
     */
    constructor(name?: string, attributes?: Attribute[], connections?: Connection[], id?: number) {
        this.name = name || "";
        this.attributes = attributes || [];
        this.connections = connections || [];
        if (id) this.id = id;
    }
}
