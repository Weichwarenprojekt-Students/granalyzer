import ApiLabel from "@/models/ApiLabel";
import ApiRelation from "@/models/ApiRelation";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { GET } from "@/utility";

export class SchemesState {
    /**
     * All the labels from the backend
     */
    public labels = new Array<ApiLabel>();
    /**
     * All the relations from the backend
     */
    public relations = new Array<ApiRelation>();
    /**
     * The currently selected label
     */
    public selectedLabel?: ApiLabel;
    /**
     * The currently selected relation
     */
    public selectedRelation?: ApiRelation;
}

export const schemes = {
    namespaced: true,
    state: new SchemesState(),
    mutations: {
        /**
         * Set the labels
         */
        setLabels(state: SchemesState, labels: Array<ApiLabel>): void {
            state.labels = labels;
        },
        /**
         * Set the labels
         */
        setRelations(state: SchemesState, relations: Array<ApiRelation>): void {
            state.relations = relations;
        },
        /**
         * Select a label
         */
        selectLabel(state: SchemesState, label: ApiLabel): void {
            state.selectedLabel = label;
            state.selectedRelation = undefined;
        },
        /**
         * Select a relation
         */
        selectRelation(state: SchemesState, relation: ApiRelation): void {
            state.selectedLabel = undefined;
            state.selectedRelation = relation;
        },
    },
    actions: {
        /**
         * Load the labels
         */
        async loadLabelsAndRelations(context: ActionContext<SchemesState, RootState>): Promise<void> {
            const resLabels = await GET("/api/data-scheme/label");
            if (resLabels.status === 200) context.commit("setLabels", await resLabels.json());
            const resRelations = await GET("/api/data-scheme/relation");
            if (resRelations.status === 200) context.commit("setRelations", await resRelations.json());
        },
    },
};
