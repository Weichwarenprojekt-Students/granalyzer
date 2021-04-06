import { TestUtils } from "../../test/test-utils";

export class DiagramsRepository {
    /**
     * Returns mocked db data
     */
    static mockGetDiagrams() {
        return TestUtils.mockDbResult([
            {
                diagram: {
                    diagramId: "0-0-0-0",
                    name: "diagram 1",
                    parentId: "0-0-0-2",
                },
            },
            {
                diagram: {
                    diagramId: "0-0-0-1",
                    name: "diagram 2",
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
                diagramId: "0-0-0-0",
                name: "diagram 1",
                parentId: "0-0-0-2",
            },
            {
                diagramId: "0-0-0-1",
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
                    diagramId: "0-0-0-0",
                    name: "diagram 1",
                },
            },
        ]);
    }

    /**
     * Predicted response from get all diagrams
     */
    static resultGetDiagram() {
        return {
            diagramId: "0-0-0-0",
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
                    diagramId: "0-0-0-0",
                    name: "added diagram",
                },
            },
        ]);
    }

    /**
     * Predicted response from addDiagram
     */
    static resultAddDiagram() {
        return {
            diagramId: "0-0-0-0",
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
                    diagramId: "0-0-0-0",
                    name: "update diagram",
                },
            },
        ]);
    }

    /**
     * Predicted response from updateDiagram
     */
    static resultUpdateDiagram() {
        return {
            diagramId: "0-0-0-0",
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
                    diagramId: "0-0-0-0",
                    name: "delete diagram",
                },
            },
        ]);
    }

    /**
     * Predicted response from deleteDiagram
     */
    static resultDeleteDiagram() {
        return {
            diagramId: "0-0-0-0",
            name: "delete diagram",
        };
    }
}
