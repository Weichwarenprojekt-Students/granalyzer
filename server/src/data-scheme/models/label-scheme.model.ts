import { Attribute } from "./attributes.model";
import { ApiProperty } from "@nestjs/swagger";
import { IsHexColor, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { IsAttributeDefinition } from "../validators/scheme-attribute.validator";

export class LabelScheme {
    @ApiProperty({
        required: true,
        type: "string",
        name: "name",
        description: "Unique Name of the label scheme",
    })
    @IsString()
    name: string;

    @ApiProperty({
        required: false,
        type: "string",
        name: "color",
        description: "Color of the label scheme",
    })
    @IsHexColor()
    color: string;

    @ApiProperty({
        required: true,
        type: [Attribute],
        name: "attributes",
        description: "Array containing all attributes of the label scheme",
    })
    @Type(() => Attribute)
    @ValidateNested({ each: true })
    @IsAttributeDefinition()
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
