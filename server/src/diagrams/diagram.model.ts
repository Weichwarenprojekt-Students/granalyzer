import { ApiProperty } from "@nestjs/swagger";
import { IsJSON } from "class-validator";
import { IsValidName } from "../validator/name-validator";

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
    @IsValidName()
    name: string;

    @ApiProperty({
        required: false,
        type: "string",
        name: "parentId",
        description: "The id of the parent folder",
    })
    parentId: string = null;

    @ApiProperty({
        required: false,
        type: "string",
        name: "serialized",
        description: "Serialized JSON object of diagram",
    })
    @IsJSON()
    serialized: string;

    /**
     * Constructor
     *
     * @param name The name of the diagram
     * @param serialized Serialized JSON object of diagram
     */
    constructor(name?: string, serialized?: string) {
        this.name = name ?? "";
        this.serialized = serialized ?? "{}";
    }
}
