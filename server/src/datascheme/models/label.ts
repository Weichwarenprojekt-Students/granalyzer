import { Attribute } from "./attributes";

export class Label {
    /**
     * Name of the label
     */
    name: string;

    /**
     * Color of the label
     */
    color: string;

    /**
     * Array with all attributes of the label
     */
    attributes: Attribute[];

    /**
     * Constructor
     *
     * @param name name of the label
     * @param color color of the label
     * @param attributes attributes of the label
     */
    constructor(name?: string, color?: string, attributes?: Attribute[]) {
        this.name = name || "";
        this.color = color || "#000";
        this.attributes = attributes || [];
    }
}
