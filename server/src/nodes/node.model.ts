import { ApiProperty } from "@nestjs/swagger";
import { Label } from "../data-scheme/models/label";
import { RelationType } from "../data-scheme/models/relationType";

export default class Node {
    @ApiProperty({
        required: false,
        type: "number",
        name: "id",
        description: "The id of the node",
    })
    public id?: number;

    @ApiProperty({
        required: true,
        type: "string",
        name: "name",
        description: "The name of the node",
    })
    public name: string;

    @ApiProperty({
        required: true,
        type: [Label],
        name: "label",
        description: "Label of the node",
    })
    public label: string;

    @ApiProperty({
        required: true,
        type: [RelationType],
        name: "name",
        description: "The name of the diagram",
    })
    public attributes: any;

    constructor(name: string, label: string, attributes: any, id?: number) {
        this.name = name;
        this.label = label;
        this.id = id;
        this.attributes = attributes;
    }
}
