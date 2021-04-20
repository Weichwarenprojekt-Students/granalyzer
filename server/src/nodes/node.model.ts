import { ApiProperty } from "@nestjs/swagger";
import { IsObject, IsString } from "class-validator";

export default class Node {
    @ApiProperty({
        required: false,
        type: "string",
        name: "nodeId",
        description: "The id of the node",
    })
    @IsString()
    public nodeId?: string;

    @ApiProperty({
        required: true,
        type: "string",
        name: "name",
        description: "The name of the node",
    })
    @IsString()
    public name: string;

    @ApiProperty({
        required: true,
        type: "string",
        name: "label",
        description: "Label of the node",
    })
    @IsString()
    public label: string;

    @ApiProperty({
        required: true,
        type: "any",
        name: "attributes",
        description: "The nodes attributes",
    })
    @IsObject()
    public attributes: any;

    constructor(name: string, label: string, attributes: any, id = "") {
        this.name = name;
        this.label = label;
        this.nodeId = id;
        this.attributes = attributes;
    }
}
