export default class ApiNode {
    /**
     * Node model
     *
     * @param name Name of the node
     * @param label Label the node is related to
     * @param nodeId Id of the node
     * @param attributes? Additional attributes of the node
     * @param color? Color of the label type
     */
    constructor(
        public name: string,
        public label: string,
        public nodeId: string = "",
        // eslint-disable-next-line
        public attributes?: any,
        public color?: string,
    ) {}
}
