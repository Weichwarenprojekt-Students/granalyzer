import { Attribute } from "./attributes.model";
import { Connection } from "./connection.model";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class RelationType {
    // Add type attribute to differentiate between LabelScheme
    type: "RelationType";

    @ApiProperty({
        required: true,
        type: "string",
        name: "name",
        description: "Id of the relation type scheme",
    })
    @IsString()
    name: string;

    @ApiProperty({
        required: true,
        type: [Attribute],
        name: "attributes",
        description: "Array containing all attributes of the relation type scheme",
    })
    @IsArray()
    @Type(() => Attribute)
    @ValidateNested({ each: true })
    attributes: Attribute[];

    @ApiProperty({
        required: true,
        type: [Connection],
        name: "connections",
        description: "Array containing all connections of the relation type scheme",
    })
    @IsArray()
    @Type(() => Connection)
    @ValidateNested({ each: true })
    connections: Connection[];

    /**
     * Constructor
     *
     * @param name Name of the relation type
     * @param attributes Attributes of the relation type
     * @param connections Possible connections of the relation type
     */
    constructor(name?: string, attributes?: Attribute[], connections?: Connection[]) {
        this.name = name ?? "";
        this.attributes = attributes ?? [];
        this.connections = connections ?? [];
    }
}
