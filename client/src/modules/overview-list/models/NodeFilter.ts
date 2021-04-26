export class NodeFilter {
    /**
     * Model for the node overview filter
     *
     * @param nameFilter The name filter (from search bar)
     * @param labelFilter The label filter
     */
    constructor(public nameFilter = "", public labelFilter = new Array<string>()) {}
}
