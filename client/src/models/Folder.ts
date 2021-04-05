export class Folder {
    /**
     * Folder Model
     *
     * @param name Name of the specific folder
     * @param folderId Identifier
     */
    constructor(public name: string = "", public folderId: string = "") {}

    /**
     * Copy the folder
     */
    public static copy(folder: Folder): Folder {
        return new Folder(folder.name, folder.folderId);
    }
}
