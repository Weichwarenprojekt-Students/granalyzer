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
        name: "from",
        description: "Id of the node where the relation starts",
    })
    public from: number;

    @ApiProperty({
        required: true,
        type: "number",
        name: "to",
        description: "Id of the node where the relation ends",
    })
    public to: number;

    /**
     * Constructor
     *
     * @param type Type of the relation
     * @param from Id of the node where the relation starts
     * @param to Id of the node where the relation ends
     * @param attributes Attributes of the relation
     * @param id Id of the relation
     */
    constructor(type: string, from: number, to: number, attributes: any, id?: number) {
        this.type = type;
        this.from = from;
        this.to = to;
        this.attributes = attributes;
        this.id = id;
    }
}
