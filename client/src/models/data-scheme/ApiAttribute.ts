export class ApiAttribute {
    /**
     * The model for an attribute (e.g. of a label)
     *
     * @param datatype The datatype of the attribute
     * @param name The name
     * @param mandatory True if the attribute is mandatory
     * @param defaultValue The default value
     */
    constructor(
        public name: string = "done",
        public datatype: string = "string",
        public mandatory: boolean = false,
        public defaultValue: string = "",
    ) {}

    /**
     * Check if two attributes are equal
     *
     * @param first The other attribute
     * @param second The other attribute
     * @return True if the attributes are equal
     */
    public static isEqual(first: ApiAttribute, second: ApiAttribute): boolean {
        return (
            first.datatype === second.datatype &&
            first.name === second.name &&
            first.mandatory === second.mandatory &&
            first.defaultValue === second.defaultValue
        );
    }
}
