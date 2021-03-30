import { Label } from "./models/label";
import { RelationType } from "./models/relationType";
import { ApiProperty } from "@nestjs/swagger";

export class Scheme {
    @ApiProperty({
        required: true,
        type: [Label],
        name: "labels",
        description: "Array containing all label schemes",
    })
    labels: Label[];

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
    constructor(labels: Label[], relationTypes: RelationType[]) {
        this.labels = labels;
        this.relationTypes = relationTypes;
    }
}
