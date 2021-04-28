import ApiLabel from "@/models/data-scheme/ApiLabel";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { GET } from "@/utility";
import { ApiDatatype } from "@/models/data-scheme/ApiDatatype";

export class HeatMapState {
    /**
     * The labels of the diagram
     */
    public labels: ApiLabel[] = [];
}

export const heatMap = {
    state: new HeatMapState(),
    mutations: {
        /**
         * set the active labels of the diagram with number attributes
         */
        setHeatLabels(state: HeatMapState, labels: ApiLabel[]): void {
            labels.forEach((label) => {
                label.attributes = label.attributes.filter((attr) => attr.datatype == ApiDatatype.NUMBER);
            });
            state.labels = labels;
        },
    },
    actions: {
        /**
         * get all labels which are in the diagram
         * @param context
         */
        async getHeatLabels(context: ActionContext<HeatMapState, RootState>): Promise<void> {
            const labels: ApiLabel[] = [];
            const getter = context.rootGetters["editor/labels"];
            for (const label of getter) {
                const res = await GET("/api/data-scheme/label/" + label);
                const newVar: ApiLabel = await res.json();
                labels.push(newVar);
            }
            context.commit("setHeatLabels", labels);
        },
    },
    getters: {},
};
