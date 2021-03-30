import { ApiProperty } from "@nestjs/swagger";

export default class Node {
    @ApiProperty()
    public id?: number;

    @ApiProperty()
    public name: string;

    @ApiProperty()
    public label: string;

    @ApiProperty()
    public attributes: any;

    constructor(name: string, label: string, attributes: any, id?: number) {
        this.name = name;
        this.label = label;
        this.id = id;
        this.attributes = attributes;
    }
}
