export class HeatMapAttribute {
    /**
     *
     * @param from The start value of the heat map
     * @param to The end value of the heat map
     * @param labelName the label for which the heat map is created
     * @param selectedAttributeName the selected attribute of the label
     */
    constructor(
        public labelName: string,
        public selectedAttributeName: string | null,
        public from: number = 0,
        public to: number = 10,
    ) {}
}
