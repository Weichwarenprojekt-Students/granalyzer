import { Attribute } from "./attributes";
import { ApiProperty } from "@nestjs/swagger";

export class Label {
    @ApiProperty({
        required: false,
        type: "number",
        name: "id",
        description: "Id of the label scheme",
    })
    id?: number;

    @ApiProperty({
        required: true,
        type: "number",
        name: "id",
        description: "Id of the label scheme",
    })
    name: string;

    @ApiProperty({
        required: true,
        type: "string",
        name: "color",
        description: "Color of the label scheme",
    })
    color: string;

    @ApiProperty({
        required: true,
        type: [Attribute],
        name: "attributes",
        description: "Array containing all attributes of the label scheme",
    })
    attributes: Attribute[];

    /**
     * Constructor
     *
     * @param name name of the label
     * @param color color of the label
     * @param attributes attributes of the label
     * @param id ID in the database
     */
    constructor(name?: string, color?: string, attributes?: Attribute[], id?: number) {
        this.name = name || "";
        this.color = color || "#000";
        this.attributes = attributes || [];
        if (id) this.id = id;
    }
}
