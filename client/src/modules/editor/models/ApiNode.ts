export default class ApiNode {
    /**
     * Node model
     *
     * @param name Name of the node
     * @param label Label the node is related to
     * @param id Id of the node
     * @param attributes? Additional attributes of the node
     * @param color? Color of the label type
     */
    constructor(
        public name: string,
        public label: string,
        public id: string = "",
        // eslint-disable-next-line
        public attributes?: any,
        public color?: string,
    ) {}
}
