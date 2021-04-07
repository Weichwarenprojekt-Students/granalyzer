import { Attribute } from "./attributes";
import { ApiProperty } from "@nestjs/swagger";

export class LabelScheme {
    @ApiProperty({
        required: true,
        type: "string",
        name: "name",
        description: "Unique Name of the label scheme",
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
     */
    constructor(name?: string, color?: string, attributes?: Attribute[]) {
        this.name = name ?? "";
        this.color = color ?? "#000";
        this.attributes = attributes ?? [];
    }
}
