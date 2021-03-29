import { TestUtils } from "../../test/test-utils";

export class UtilsRepository {
    /**
     * Returns mocked DB data for a correct label type
     */
    static mockCheckElementForLabel(label: string) {
        return TestUtils.mockDbResult([
            {
                label: [label],
            },
        ]);
    }

    /**
     * Returns mocked DB data for a wrong label type
     */
    static mockCheckElementForLabelNAE() {
        return TestUtils.mockDbResult([
            {
                label: ["Not_the_label_you_are_looking_for"],
            },
        ]);
    }

    /**
     * Return the mocked DB data for a NotFoundException
     */
    static mockCheckElementForLabelNFE() {
        return TestUtils.mockDbResult([]);
    }
}
