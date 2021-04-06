import { TestUtils } from "../../test/test-utils";

export class FoldersRepository {
    /**
     * Returns mocked db data
     */
    static mockGetFolders() {
        return TestUtils.mockDbResult([
            {
                folder: {
                    name: "folder 1",
                    folderId: "0-0-0-0",
                    parentId: "0-0-0-2",
                },
            },
            {
                folder: {
                    folderId: "0-0-0-1",
                    name: "folder 2",
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
                folderId: "0-0-0-0",
                name: "folder 1",
                parentId: "0-0-0-2",
            },
            {
                folderId: "0-0-0-1",
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
                    folderId: "0-0-0-0",
                    name: "folder 1",
                },
            },
        ]);
    }

    /**
     * Predicted response from get all folders
     */
    static resultGetFolder() {
        return {
            folderId: "0-0-0-0",
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
                    folderId: "0-0-0-0",
                    name: "added folder",
                },
            },
        ]);
    }

    /**
     * Predicted response from addFolder
     */
    static resultAddFolder() {
        return {
            folderId: "0-0-0-0",
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
                    folderId: "0-0-0-0",
                    name: "updated folder",
                },
            },
        ]);
    }

    /**
     * Predicted response from updateFolder
     */
    static resultUpdateFolder() {
        return {
            folderId: "0-0-0-0",
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
                    folderId: "0-0-0-0",
                    name: "deleted folder",
                },
            },
        ]);
    }

    /**
     * Predicted response from deleteFolder
     */
    static resultDeleteFolder() {
        return {
            folderId: "0-0-0-0",
            name: "deleted folder",
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockGetFoldersInFolder() {
        return TestUtils.mockDbResult([
            {
                folder: {
                    folderId: "0-0-0-2",
                    name: "inner folder",
                },
            },
            {
                folder: {
                    folderId: "0-0-0-3",
                    name: "inner folder",
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
                folderId: "0-0-0-2",
                name: "inner folder",
            },
            {
                folderId: "0-0-0-3",
                name: "inner folder",
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
                    folderId: "0-0-0-2",
                    name: "child folder",
                },
            },
        ]);
    }

    /**
     * Predicted response from getFolderInFolder
     */
    static resultGetFolderInFolder() {
        return {
            folderId: "0-0-0-2",
            name: "child folder",
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockAddFolderToFolder() {
        return TestUtils.mockDbResult([
            {
                folder: {
                    folderId: "0-0-0-2",
                    name: "folder 3",
                },
            },
        ]);
    }

    /**
     * Predicted response from addFolderToFolder
     */
    static resultAddFolderToFolder() {
        return {
            folderId: "0-0-0-2",
            name: "folder 3",
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockRemoveFolderFromFolder() {
        return TestUtils.mockDbResult([
            {
                folder: {
                    folderId: "0-0-0-2",
                    name: "removed folder",
                },
            },
        ]);
    }

    /**
     * Predicted response from removeFolderFromFolder
     */
    static resultRemoveFolderFromFolder() {
        return {
            folderId: "0-0-0-2",
            name: "removed folder",
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockGetAllRootFolders() {
        return TestUtils.mockDbResult([
            {
                folder: {
                    folderId: "0-0-0-0",
                    name: "folder 1",
                },
            },
            {
                folder: {
                    folderId: "0-0-0-1",
                    name: "folder 2",
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
                folderId: "0-0-0-0",
                name: "folder 1",
            },
            {
                folderId: "0-0-0-1",
                name: "folder 2",
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
                    folderId: "0-0-0-2",
                    name: "inner diagram",
                },
            },
            {
                diagram: {
                    folderId: "0-0-0-3",
                    name: "inner diagram",
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
                folderId: "0-0-0-2",
                name: "inner diagram",
            },
            {
                folderId: "0-0-0-3",
                name: "inner diagram",
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
                    folderId: "0-0-0-2",
                    name: "child diagram",
                },
            },
        ]);
    }

    /**
     * Predicted response from getDiagramInFolder
     */
    static resultGetDiagramInFolder() {
        return {
            folderId: "0-0-0-2",
            name: "child diagram",
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockAddDiagramToFolder() {
        return TestUtils.mockDbResult([
            {
                diagram: {
                    folderId: "0-0-0-2",
                    name: "diagram 3",
                },
            },
        ]);
    }

    /**
     * Predicted response from addDiagramToFolder
     */
    static resultAddDiagramToFolder() {
        return {
            folderId: "0-0-0-2",
            name: "diagram 3",
        };
    }

    /**
     * Returns mocked DB data
     */
    static mockRemoveDiagramFromFolder() {
        return TestUtils.mockDbResult([
            {
                diagram: {
                    folderId: "0-0-0-2",
                    name: "removed diagram",
                },
            },
        ]);
    }

    /**
     * Predicted response from removeDiagramFromFolder
     */
    static resultRemoveDiagramFromFolder() {
        return {
            folderId: "0-0-0-2",
            name: "removed diagram",
        };
    }
}
