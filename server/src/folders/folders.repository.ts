import * as neo4j from "neo4j-driver";
import { TestUtils } from "../../test/test-utils";

export class FoldersRepository {
    /**
     * Returns mocked db data
     */
    static mockGetFolders() {
        return TestUtils.mockDbResult([
            {
                folder: {
                    identity: neo4j.int(0),
                    properties: {
                        name: "folder 1",
                    },
                },
                parentId: neo4j.int(2),
            },
            {
                folder: {
                    identity: neo4j.int(1),
                    properties: {
                        name: "folder 2",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from get all folders
     */
    static resultGetFolders() {
        return [
            {
                id: 0,
                name: "folder 1",
                parentId: 2,
            },
            {
                id: 1,
                name: "folder 2",
                parentId: undefined,
            },
        ];
    }

    /**
     * Returns mocked db data
     */
    static mockGetFolder() {
        return TestUtils.mockDbResult([
            {
                folder: {
                    identity: neo4j.int(0),
                    properties: {
                        name: "folder 1",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from get all folders
     */
    static resultGetFolder() {
        return {
            id: 0,
            name: "folder 1",
            parentId: undefined,
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockAddFolder() {
        return TestUtils.mockDbResult([
            {
                folder: {
                    identity: neo4j.int(0),
                    properties: {
                        name: "added folder",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from addFolder
     */
    static resultAddFolder() {
        return {
            id: 0,
            name: "added folder",
            parentId: undefined,
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockUpdateFolder() {
        return TestUtils.mockDbResult([
            {
                folder: {
                    identity: neo4j.int(0),
                    properties: {
                        name: "updated folder",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from updateFolder
     */
    static resultUpdateFolder() {
        return {
            id: 0,
            name: "updated folder",
            parentId: undefined,
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockDeleteFolder() {
        return TestUtils.mockDbResult([
            {
                folder: {
                    identity: neo4j.int(0),
                    properties: {
                        name: "deleted folder",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from deleteFolder
     */
    static resultDeleteFolder() {
        return {
            id: 0,
            name: "deleted folder",
            parentId: undefined,
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockGetFoldersInFolder() {
        return TestUtils.mockDbResult([
            {
                folder: {
                    identity: neo4j.int(2),
                    labels: ["Folder"],
                    properties: {
                        name: "inner folder",
                    },
                },
            },
            {
                folder: {
                    identity: neo4j.int(3),
                    labels: ["Folder"],
                    properties: {
                        name: "inner folder",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from getFoldersInFolder
     */
    static resultGetFoldersInFolder() {
        return [
            {
                id: 2,
                name: "inner folder",
                parentId: undefined,
            },
            {
                id: 3,
                name: "inner folder",
                parentId: undefined,
            },
        ];
    }

    /**
     * Returns mocked DB data
     */
    static mockGetFolderInFolder() {
        return TestUtils.mockDbResult([
            {
                folder: {
                    identity: neo4j.int(2),
                    labels: ["Folder"],
                    properties: {
                        name: "child folder",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from getFolderInFolder
     */
    static resultGetFolderInFolder() {
        return {
            id: 2,
            name: "child folder",
            parentId: undefined,
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockAddFolderToFolder() {
        return TestUtils.mockDbResult([
            {
                folder: {
                    identity: neo4j.int(2),
                    labels: ["Folder"],
                    properties: {
                        name: "folder 3",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from addFolderToFolder
     */
    static resultAddFolderToFolder() {
        return {
            id: 2,
            name: "folder 3",
            parentId: undefined,
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockRemoveFolderFromFolder() {
        return TestUtils.mockDbResult([
            {
                folder: {
                    identity: neo4j.int(2),
                    labels: ["Folder"],
                    properties: {
                        name: "removed folder",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from removeFolderFromFolder
     */
    static resultRemoveFolderFromFolder() {
        return {
            id: 2,
            name: "removed folder",
            parentId: undefined,
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockGetAllRootFolders() {
        return TestUtils.mockDbResult([
            {
                folder: {
                    identity: neo4j.int(0),
                    labels: ["Folder"],
                    properties: {
                        name: "folder 1",
                    },
                },
            },
            {
                folder: {
                    identity: neo4j.int(1),
                    labels: ["Folder"],
                    properties: {
                        name: "folder 2",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from getAllRootFolders
     */
    static resultGetAllRootFolders() {
        return [
            {
                id: 0,
                name: "folder 1",
                parentId: undefined,
            },
            {
                id: 1,
                name: "folder 2",
                parentId: undefined,
            },
        ];
    }

    /**
     * Returns mocked DB data
     */
    static mockGetDiagramsInFolder() {
        return TestUtils.mockDbResult([
            {
                diagram: {
                    identity: neo4j.int(2),
                    labels: ["Folder"],
                    properties: {
                        name: "inner diagram",
                    },
                },
            },
            {
                diagram: {
                    identity: neo4j.int(3),
                    labels: ["Diagram"],
                    properties: {
                        name: "inner diagram",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from getDiagramsInFolder
     */
    static resultGetDiagramsInFolder() {
        return [
            {
                id: 2,
                name: "inner diagram",
                parentId: undefined,
            },
            {
                id: 3,
                name: "inner diagram",
                parentId: undefined,
            },
        ];
    }

    /**
     * Returns mocked DB data
     */
    static mockGetDiagramInFolder() {
        return TestUtils.mockDbResult([
            {
                diagram: {
                    identity: neo4j.int(2),
                    labels: ["Diagram"],
                    properties: {
                        name: "child diagram",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from getDiagramInFolder
     */
    static resultGetDiagramInFolder() {
        return {
            id: 2,
            name: "child diagram",
            parentId: undefined,
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockAddDiagramToFolder() {
        return TestUtils.mockDbResult([
            {
                diagram: {
                    identity: neo4j.int(2),
                    labels: ["Diagram"],
                    properties: {
                        name: "diagram 3",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from addDiagramToFolder
     */
    static resultAddDiagramToFolder() {
        return {
            id: 2,
            name: "diagram 3",
            parentId: undefined,
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockRemoveDiagramFromFolder() {
        return TestUtils.mockDbResult([
            {
                diagram: {
                    identity: neo4j.int(2),
                    labels: ["Diagram"],
                    properties: {
                        name: "removed diagram",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from removeDiagramFromFolder
     */
    static resultRemoveDiagramFromFolder() {
        return {
            id: 2,
            name: "removed diagram",
            parentId: undefined,
        };
    }
}
