import { IsString } from "class-validator";

export class Connection {
    /**
     * The start label of the relation
     */
    @IsString()
    from: string;

    /**
     * The target label of the relation
     */
    @IsString()
    to: string;

    /**
     * Constructor
     *
     * @param from The label from which the relation is outgoing
     * @param to The label to which the relation is incoming
     */
    constructor(from?: string, to?: string) {
        this.from = from ?? "";
        this.to = to ?? "";
    }
}
