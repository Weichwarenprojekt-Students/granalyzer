import { ApiProperty } from "@nestjs/swagger";

export class Diagram {
    @ApiProperty({
        required: true,
        type: "number",
        name: "id",
        description: "Id of the diagram",
    })
    id: number;

    @ApiProperty({
        required: true,
        type: "string",
        name: "name",
        description: "Name of the diagram",
    })
    name: string;

    @ApiProperty({
        required: false,
        type: "number",
        name: "parentId",
        description: "The Id of the parent folder",
    })
    parentId?: number;
}
