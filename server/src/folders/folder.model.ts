import { ApiProperty } from "@nestjs/swagger";
import { IsValidName } from "../validator/name-validator";

export class Folder {
    @ApiProperty({
        required: true,
        type: "string",
        name: "folderId",
        description: "Id of the folder",
    })
    folderId: string;

    @ApiProperty({
        required: true,
        type: "string",
        name: "name",
        description: "Name of the folder",
    })
    @IsValidName()
    name: string;

    @ApiProperty({
        required: false,
        type: "number",
        name: "parentId",
        description: "The Id of the parent folder",
    })
    parentId?: string;

    /**
     * Constructor
     *
     * @param name Name of the folder
     */
    constructor(name?: string) {
        this.name = name ?? "";
    }
}
