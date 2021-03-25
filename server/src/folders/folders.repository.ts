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
            },
            {
                id: 1,
                name: "folder 2",
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
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockGetChildrenOfFolder() {
        return TestUtils.mockDbResult([
            {
                n: {
                    identity: neo4j.int(2),
                    labels: ["Diagram"],
                    properties: {
                        name: "inner chart",
                    },
                },
            },
            {
                n: {
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
     * Predicted response from getChildrenOfFolder
     */
    static resultGetChildrenOfFolder() {
        return [
            {
                id: 2,
                name: "inner chart",
            },
            {
                id: 3,
                name: "inner folder",
            },
        ];
    }

    /**
     * Returns mocked DB data
     */
    static mockGetChildOfFolder() {
        return TestUtils.mockDbResult([
            {
                n: {
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
     * Predicted response from getChildOfFolder
     */
    static resultGetChildOfFolder() {
        return {
            id: 2,
            name: "child diagram",
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockAddChildToFolder() {
        return TestUtils.mockDbResult([
            {
                n: {
                    identity: neo4j.int(2),
                    labels: ["Diagram"],
                    properties: {
                        name: "chart 3",
                    },
                },
            },
        ]);
    }

    /**
     * Returns mocked DB data
     */
    static mockValidateParentAndChildById() {
        return TestUtils.mockDbResult([
            {
                n: {
                    identity: neo4j.int(5),
                    labels: ["Folder"],
                    properties: {
                        name: "folder 3",
                    },
                },
            },
            {
                n: {
                    identity: neo4j.int(2),
                    labels: ["Diagram"],
                    properties: {
                        name: "chart 3",
                    },
                },
            },
        ]);
    }

    /**
     * Returns mocked DB data with type error
     */
    static mockValidateParentAndChildByIdError() {
        return TestUtils.mockDbResult([
            {
                n: {
                    identity: neo4j.int(5),
                    labels: ["Folder"],
                    properties: {
                        name: "folder 3",
                    },
                },
            },
            {
                n: {
                    identity: neo4j.int(2),
                    labels: ["Mirko"],
                    properties: {
                        name: "chart 3",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from addChildToFolder
     */
    static resultAddChildToFolder() {
        return {
            id: 2,
            name: "chart 3",
        };
    }

    static mockRemoveChildFromFolder() {
        return TestUtils.mockDbResult([
            {
                n: {
                    identity: neo4j.int(2),
                    labels: ["Diagram"],
                    properties: {
                        name: "removed chart",
                    },
                },
            },
        ]);
    }

    static resultRemoveChildFromFolder() {
        return {
            id: 2,
            name: "removed chart",
        };
    }

    static mockGetAllRootElements() {
        return TestUtils.mockDbResult([
            {
                n: {
                    identity: neo4j.int(0),
                    labels: ["Folder"],
                    properties: {
                        name: "folder 1",
                    },
                },
            },
            {
                n: {
                    identity: neo4j.int(1),
                    labels: ["Diagram"],
                    properties: {
                        name: "diagram 1",
                    },
                },
            },
        ]);
    }

    static resultGetAllRootElements() {
        return [
            {
                id: 0,
                name: "folder 1",
            },
            {
                id: 1,
                name: "diagram 1",
            },
        ];
    }
}
