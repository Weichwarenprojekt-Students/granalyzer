export default class ApiNode {
    /**
     * Node model
     *
     * @param name Name of the node
     * @param label Label the node is related to
     * @param id Id of the node
     * @param attributes Additional attributes of the node
     * @param color Color of the label type
     */
    constructor(
        public name: string = "",
        public label: string = "",
        public id: number = 0,
        public attributes: {
            [key: string]: unknown;
        } = {},
        public color: string = "#333",
    ) {}
}
