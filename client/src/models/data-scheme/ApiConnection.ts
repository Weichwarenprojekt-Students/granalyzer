export class ApiConnection {
    /**
     * Model for the relation type connections from the API
     *
     * @param from From label
     * @param to To label
     */
    constructor(public from: string = "", public to: string = "") {}
}
