
export class HeatAttribute {
    /**
     *
     * @param from The start value of the heat map
     * @param to The end value of the heat map
     * @param labelName the label for which the heat map is created
     * @param selectedAttributeName the selected attribute of the label
     */
    constructor(
        public from: number | null = null,
        public to:number | null = null,
        public labelName: string | null = null,
        public selectedAttributeName: string | null = null) {}

}