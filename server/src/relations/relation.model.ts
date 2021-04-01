export default class Relation {
    public id?: number;

    public type: string;

    public attributes: any;

    public start: number;

    public end: number;

    constructor(type: string, start: number, end: number, attributes: any, id?: number) {
        this.type = type;
        this.start = start;
        this.end = end;
        this.attributes = attributes;
        this.id = id;
    }
}
