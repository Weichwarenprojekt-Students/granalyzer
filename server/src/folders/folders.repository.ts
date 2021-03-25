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
     * Return an empty response
     */
    static mockEmptyResponse() {
        return TestUtils.mockDbResult([]);
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
     * Returns mocked DB data for a folder type
     */
    static mockIsFolder() {
        return TestUtils.mockDbResult([
            {
                label: ["Folder"],
            },
        ]);
    }

    /**
     * Returns mocked DB data for not a folder type
     */
    static mockIsNotFolder() {
        return TestUtils.mockDbResult([
            {
                label: ["Diagram"],
            },
        ]);
    }
}
