import { LabelScheme } from "./models/label-scheme.model";
import { RelationType } from "./models/relation-type.model";
import { ApiProperty } from "@nestjs/swagger";

export class Scheme {
    @ApiProperty({
        required: true,
        type: [LabelScheme],
        name: "labels",
        description: "Array containing all label schemes",
    })
    labels: LabelScheme[];

    @ApiProperty({
        required: true,
        type: [RelationType],
        name: "relationTypes",
        description: "Array containing all relation typ schemes",
    })
    relationTypes: RelationType[];

    /**
     * Constructor
     *
     * @param labels Labels of the scheme
     * @param relationTypes Relation types of the scheme
     */
    constructor(labels: LabelScheme[], relationTypes: RelationType[]) {
        this.labels = labels;
        this.relationTypes = relationTypes;
    }
}
