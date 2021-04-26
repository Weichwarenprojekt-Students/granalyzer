import { ApiDatatype } from "@/models/data-scheme/ApiDatatype";

export class InspectorAttribute {
    /**
     * Constructor
     *
     * @param name The name of the attribute
     * @param value The value of the attribute
     * @param datatype The datatype of the value
     * @param active True if the attribute is active (not deleted)
     */
    constructor(
        public name: string = "",
        public value: string | number = "",
        public datatype: string = ApiDatatype.STRING,
        public active = false,
    ) {}

    /**
     * Check two inspector attributes for equality
     *
     * @param other The other attribute
     * @return True if the objects are equal
     */
    public isEqual(other: InspectorAttribute): boolean {
        if (!this.active && this.active === other.active) return true;
        return this.active === other.active && this.value === other.value;
    }
}
