export default class Node {
    /**
     * Node model
     *
     * @param name Name of the node
     * @param label Label the node is related to
     * @param attributes Additional attributes of the node
     * @param id Id of the node
     * @param color Color of the label type
     */
    constructor(
        public name: string,
        public label: string,
        // eslint-disable-next-line
        public attributes?: any,
        public id?: number,
        public color?: string,
    ) {}
}
