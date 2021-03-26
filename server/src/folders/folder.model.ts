import { ApiProperty } from "@nestjs/swagger";

export class Folder {
    @ApiProperty({
        required: true,
        type: "number",
        name: "id",
        description: "Id of the folder",
    })
    id: number;

    @ApiProperty({
        required: true,
        type: "string",
        name: "name",
        description: "Name of the folder",
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
