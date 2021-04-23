import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";
import { IsAttributesObject } from "../data-scheme/validators/attribute.validator";

export default class Relation {
    @ApiProperty({
        required: false,
        type: "string",
        name: "relationId",
        description: "Id of the relation",
    })
    @IsString()
    public relationId?: string;

    @ApiProperty({
        required: true,
        type: "string",
        name: "type",
        description: "Type of the relation",
    })
    @IsString()
    @MinLength(1)
    public type: string;

    @ApiProperty({
        required: true,
        type: "any",
        name: "attributes",
        description: "Attributes of the relation",
    })
    @IsAttributesObject()
    public attributes: any;

    @ApiProperty({
        required: true,
        type: "string",
        name: "from",
        description: "Id of the node where the relation starts",
    })
    @IsString()
    @MinLength(1)
    public from: string;

    @ApiProperty({
        required: true,
        type: "string",
        name: "to",
        description: "Id of the node where the relation ends",
    })
    @IsString()
    @MinLength(1)
    public to: string;

    /**
     * Constructor
     *
     * @param type Type of the relation
     * @param from Id of the node where the relation starts
     * @param to Id of the node where the relation ends
     * @param attributes Attributes of the relation
     * @param id Id of the relation
     */
    constructor(type: string, from: string, to: string, attributes: any, id = "") {
        this.type = type;
        this.from = from;
        this.to = to;
        this.attributes = attributes;
        this.relationId = id;
    }
}
