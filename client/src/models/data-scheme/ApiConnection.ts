export class ApiConnection {
    /**
     * Model for the relation type connections from the API
     *
     * @param from From label
     * @param to To label
     */
    constructor(public from: string = "", public to: string = "") {}

    /**
     * Check if two connections are equal
     *
     * @param first The first connection
     * @param second The second connection
     * @return True if the connections are equal
     */
    public static isEqual(first: ApiConnection, second: ApiConnection): boolean {
        return first.from === second.from && first.to === second.to;
    }
}
