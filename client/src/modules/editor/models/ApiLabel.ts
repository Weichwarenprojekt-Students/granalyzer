export default class ApiLabel {
    /**
     * Label model
     *
     * @param name name of the label
     * @param color color of the label
     * @param attributes attributes of the label
     * @param id ID in the database
     */
    // eslint-disable-next-line
    constructor(public name?: string, public color?: string, public attributes?: any, public id?: number) {
        this.name = name ?? "";
        this.color = color ?? "#000";
        this.attributes = attributes ?? [];
        if (id) this.id = id;
    }
}
