export class Conflict {
    /**
     * Constructor
     *
     * @param modifiedItem The name of the label/relation
     * @param title The title of the message
     * @param description The description
     * @param revert The action for reverting an update
     * @param force The action to force an update
     */
    constructor(
        public modifiedItem: string = "",
        public title: string = "",
        public description: string = "",
        public revert: () => void = () => ({}),
        public force: () => void = () => ({}),
    ) {}
}
