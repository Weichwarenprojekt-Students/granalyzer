import { LabelScheme } from "./models/labelScheme";
import { RelationType } from "./models/relationType";
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
