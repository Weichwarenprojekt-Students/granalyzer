import { ApiDatatype } from "@/models/data-scheme/ApiDatatype";

export class InspectorAttribute {
    /**
     * Constructor
     *
     * @param name The name of the attribute
     * @param value The value of the attribute
     * @param datatype The datatype of the value
     */
    constructor(public name: string = "", public value: string = "", public datatype: string = ApiDatatype.STRING) {}
}
