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
}
