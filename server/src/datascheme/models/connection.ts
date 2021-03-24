export class Connection {
    /**
     * Tthe start label of the relation
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
}

/**
 * Cardinalities
 */
export enum Cardinality {
    ONE,
    N,
}
