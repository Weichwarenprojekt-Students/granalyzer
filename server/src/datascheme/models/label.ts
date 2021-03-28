import { Attribute } from "./attributes";

export class Label {
    /**
     * ID of the label
     */
    id: number;

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
     * @param id
     * @param name name of the label
     * @param color color of the label
     * @param attributes attributes of the label
     */
    constructor(id?: number, name?: string, color?: string, attributes?: Attribute[]) {
        this.id = id;
        this.name = name || "";
        this.color = color || "#000";
        this.attributes = attributes || [];
    }
}
