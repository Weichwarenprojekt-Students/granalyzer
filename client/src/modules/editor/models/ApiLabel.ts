export default class ApiLabel {
    /**
     * Label model
     *
     * @param name name of the label
     * @param color color of the label
     * @param attributes attributes of the label
     * @param id? ID in the database
     */
    constructor(public name = "", public color = "#000", public attributes = [], public id?: string) {}
}
