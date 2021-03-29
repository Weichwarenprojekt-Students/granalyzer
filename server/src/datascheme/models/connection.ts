export class Connection {
    /**
     * The start label of the relation
     */
    from: string;

    /**
     * The target label of the relation
     */
    to: string;

    /**
     * Cardinality of how many connections are incoming
     */
    incoming?: Cardinality;

    /**
     * Cardinality of how many connections are outgoing
     */
    outgoing?: Cardinality;

    /**
     * Constructor
     *
     * @param from The label from which the relation is outgoing
     * @param to The label to which the relation is incoming
     * @param incoming Cardinality of incoming relations
     * @param outgoing Cardinality of outgoing relations
     */
    constructor(from?: string, to?: string, incoming?: Cardinality | null, outgoing?: Cardinality | null) {
        this.from = from || "";
        this.to = to || "";
        if (incoming) {
            this.incoming = incoming;
        }
        if (outgoing) {
            this.outgoing = outgoing;
        }
    }
}

/**
 * Cardinalities
 */
export enum Cardinality {
    ONE,
    N,
}
