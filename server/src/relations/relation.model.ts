import { ApiProperty } from "@nestjs/swagger";

export default class Relation {
    @ApiProperty({
        required: false,
        type: "number",
        name: "id",
        description: "Id of the relation",
    })
    public id?: number;

    @ApiProperty({
        required: true,
        type: "string",
        name: "type",
        description: "Type of the relation",
    })
    public type: string;

    @ApiProperty({
        required: true,
        type: "any",
        name: "attributes",
        description: "Attributes of the relation",
    })
    public attributes: any;

    @ApiProperty({
        required: true,
        type: "number",
        name: "start",
        description: "Id of the node where the relation starts",
    })
    public start: number;

    @ApiProperty({
        required: true,
        type: "number",
        name: "end",
        description: "Id of the node where the relation ends",
    })
    public end: number;

    /**
     * Constructor
     *
     * @param type Type of the relation
     * @param start Id of the node where the relation starts
     * @param end Id of the node where the relation ends
     * @param attributes Attributes of the relation
     * @param id Id of the relation
     */
    constructor(type: string, start: number, end: number, attributes: any, id?: number) {
        this.type = type;
        this.start = start;
        this.end = end;
        this.attributes = attributes;
        this.id = id;
    }
}
