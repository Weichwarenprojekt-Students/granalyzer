import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";
import { ApiConnection } from "@/models/data-scheme/ApiConnection";

export class ApiRelationType {
    /**
     * Model for the relation type from the API
     *
     * @param id ID in the database
     * @param name Name of the relation type
     * @param attributes Attributes of the relation type
     * @param connections Connections of the relation type
     */
    constructor(
        public id: number = 0,
        public name: string = "",
        public attributes = new Array<ApiAttribute>(),
        public connections = new Array<ApiConnection>(),
    ) {}
}
