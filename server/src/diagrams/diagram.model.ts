import { ApiProperty } from "@nestjs/swagger";

export class Diagram {
    @ApiProperty({
        required: false,
        type: "number",
        name: "id",
        description: "The id of the diagram",
    })
    id?: number;

    @ApiProperty({
        required: true,
        type: "string",
        name: "name",
        description: "The name of the diagram",
    })
    name: string;

    @ApiProperty({
        required: false,
        type: "number",
        name: "parentId",
        description: "The id of the parent folder",
    })
    parentId?: number;

    @ApiProperty({
        required: false,
        type: "string",
        name: "serialized",
        description: "Serialized JSON object of diagram",
    })
    serialized?: string;
}
