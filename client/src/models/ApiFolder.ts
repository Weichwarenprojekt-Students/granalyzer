export class ApiFolder {
    /**
     * ApiFolder Model
     *
     * @param name Name of the specific folder
     * @param id Identifier
     */
    constructor(public name: string = "", public id: number = -1) {}

    /**
     * Copy the folder
     */
    public static copy(folder: ApiFolder): ApiFolder {
        return new ApiFolder(folder.name, folder.id);
    }
}
