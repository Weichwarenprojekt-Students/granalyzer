export class Folder {
    /**
     * Folder Model
     *
     * @param name Name of the specific folder
     * @param id Identifier
     */
    constructor(public name: string = "", public id: number = -1) {}

    /**
     * Copy a folder
     *
     * @param folder The folder to be copied
     * @return The copy
     */
    public static copy(folder: Folder): Folder {
        return new Folder(folder.name, folder.id);
    }
}
