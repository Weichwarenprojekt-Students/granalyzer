import * as neo4j from "neo4j-driver";
import { TestUtils } from "../../test/test-utils";

export class DiagramsRepository {
    /**
     * Returns mocked db data
     */
    static mockGetDiagrams() {
        return TestUtils.mockDbResult([
            {
                diagram: {
                    identity: neo4j.int(0),
                    properties: {
                        name: "diagram 1",
                    },
                },
            },
            {
                diagram: {
                    identity: neo4j.int(1),
                    properties: {
                        name: "diagram 2",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from get all diagrams
     */
    static resultGetDiagrams() {
        return [
            {
                id: 0,
                name: "diagram 1",
            },
            {
                id: 1,
                name: "diagram 2",
            },
        ];
    }
}
