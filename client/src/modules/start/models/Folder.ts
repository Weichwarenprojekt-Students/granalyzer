export class Folder {
    /**
     * Folder Model
     *
     * @param name Name of the specific folder
     * @param id Identifier
     */
    constructor(public name: string = "", public id: number = -1) {}

    /**
     * Copy the folder
     */
    public copy(): Folder {
        return new Folder(this.name, this.id);
    }
}
