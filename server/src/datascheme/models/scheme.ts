import { Label } from "./label";
import { RelationType } from "./relationType";

export class Scheme {
    /**
     * Array with all labels
     */
    labels: Label[];

    /**
     * Array with all relation types
     */
    relationTypes: RelationType[];

    /**
     * Constructor
     *
     * @param labels Labels of the scheme
     * @param relationTypes Relation types of the scheme
     */
    constructor(labels: Label[], relationTypes: RelationType[]) {
        this.labels = labels;
        this.relationTypes = relationTypes;
    }
}
