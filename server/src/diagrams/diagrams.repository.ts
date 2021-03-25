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

    /**
     * Returns mocked db data
     */
    static mockGetDiagram() {
        return TestUtils.mockDbResult([
            {
                diagram: {
                    identity: neo4j.int(0),
                    properties: {
                        name: "diagram 1",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from get all diagrams
     */
    static resultGetDiagram() {
        return {
            id: 0,
            name: "diagram 1",
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockAddDiagram() {
        return TestUtils.mockDbResult([
            {
                diagram: {
                    identity: neo4j.int(0),
                    properties: {
                        name: "added diagram",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from addDiagram
     */
    static resultAddDiagram() {
        return {
            id: 0,
            name: "added diagram",
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockUpdateDiagram() {
        return TestUtils.mockDbResult([
            {
                diagram: {
                    identity: neo4j.int(0),
                    properties: {
                        name: "update diagram",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from updateDiagram
     */
    static resultUpdateDiagram() {
        return {
            id: 0,
            name: "update diagram",
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockDeleteDiagram() {
        return TestUtils.mockDbResult([
            {
                diagram: {
                    identity: neo4j.int(0),
                    properties: {
                        name: "delete diagram",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from deleteDiagram
     */
    static resultDeleteDiagram() {
        return {
            id: 0,
            name: "delete diagram",
        };
    }
}
