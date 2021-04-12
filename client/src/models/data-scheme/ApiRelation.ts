export default class ApiRelation {
    /**
     * Model for the relation from the API
     *
     * @param name Name of the relation
     * @param type Type of the relation
     * @param from UUID of the start node of the relation
     * @param to UUID of the end node of the relation
     * @param relationId UUID of the relation
     * @param attributes Attributes of the relation
     */
    constructor(
        public name: string = "",
        public type: string = "",
        public from: string = "",
        public to: string = "",
        public relationId: string = "",
        public attributes: {
            [key: string]: unknown;
        } = {},
    ) {}
}
