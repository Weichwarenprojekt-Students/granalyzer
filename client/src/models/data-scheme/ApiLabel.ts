import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";

export default class ApiLabel {
    /**
     * Label model from the API
     *
     * @param name name of the label
     * @param color color of the label
     * @param attributes attributes of the label
     */
    constructor(public name = "", public color = "#FFCC80", public attributes = new Array<ApiAttribute>()) {}
}
