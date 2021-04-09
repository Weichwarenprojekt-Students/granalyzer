import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";

export class RelationType {
    /**
     * Constructor
     *
     * @param id ID in the database
     * @param name Name of the relation type
     * @param attributes Attributes of the relation type
     */
    constructor(public id: number = 0, public name: string = "", public attributes = new Array<ApiAttribute>()) {}
}
