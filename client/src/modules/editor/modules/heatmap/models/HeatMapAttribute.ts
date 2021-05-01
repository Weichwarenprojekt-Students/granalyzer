import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";

export class HeatMapAttribute {
    /**
     *
     * @param from The start value of the heat map
     * @param to The end value of the heat map
     * @param labelName the label for which the heat map is created
     * @param selectedAttribute The attribute which is selected for the heatmap view
     */
    constructor(
        public labelName: string,
        public selectedAttribute: ApiAttribute | null,
        public from?: number,
        public to?: number,
    ) {}
}
