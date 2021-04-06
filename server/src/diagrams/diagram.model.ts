import { ApiProperty } from "@nestjs/swagger";

export class Diagram {
    @ApiProperty({
        required: false,
        type: "string",
        name: "diagramId",
        description: "The id of the diagram",
    })
    diagramId: string;

    @ApiProperty({
        required: true,
        type: "string",
        name: "name",
        description: "The name of the diagram",
    })
    name: string;

    @ApiProperty({
        required: false,
        type: "string",
        name: "parentId",
        description: "The id of the parent folder",
    })
    parentId?: string;

    @ApiProperty({
        required: false,
        type: "string",
        name: "serialized",
        description: "Serialized JSON object of diagram",
    })
    serialized?: string;
}
