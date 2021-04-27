import ApiLabel from "@/models/data-scheme/ApiLabel";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { GET } from "@/utility";
import { ApiDatatype } from "@/models/data-scheme/ApiDatatype";

export class HeatMapState {
    public labels: ApiLabel[] = [];
}

export const heatMap = {
    state: new HeatMapState(),
    mutations: {
        setHeatLabels(state: HeatMapState, labels: ApiLabel[]) {
            labels.forEach((label) => {
                label.attributes = label.attributes.filter((attr) => attr.datatype == ApiDatatype.NUMBER);
            });
            state.labels = labels;
        },
    },
    actions: {
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
