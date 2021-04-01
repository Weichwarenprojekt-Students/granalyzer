export default class Node {
    /**
     * Node model
     *
     * @param name Name of the node
     * @param label Label the node is related to
     * @param attributes Additional attributes of the node
     * @param id Id of the node
     */
    // eslint-disable-next-line
    constructor(public name: string, public label: string, public attributes: any, public id?: number) {}
}
