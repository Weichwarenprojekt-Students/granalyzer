export default class ApiRelation {
    /**
     * Model for the relation from the API
     *
     * @param type Type of the relation
     * @param from UUID of the start node of the relation
     * @param to UUID of the end node of the relation
     * @param relationId UUID of the relation
     * @param attributes Attributes of the relation
     */
    constructor(
        public relationId: string = "",
        public type: string = "",
        public attributes: {
            [key: string]: string | number;
        } = {},
        public from: string = "",
        public to: string = "",
    ) {}
}
