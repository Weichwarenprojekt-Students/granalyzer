import ApiLabel from "@/models/data-scheme/ApiLabel";
import { ApiRelationType } from "@/models/data-scheme/ApiRelationType";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { GET } from "@/utility";
import { Conflict } from "@/modules/schemes/modules/conflict-view/models/Conflict";

export class SchemesState {
    /**
     * All the labels from the backend
     */
    public labels = new Array<ApiLabel>();
    /**
     * All the relations from the backend
     */
    public relations = new Array<ApiRelationType>();
    /**
     * The currently selected label
     */
    public selectedLabel?: ApiLabel;
    /**
     * The currently selected relation
     */
    public selectedRelation?: ApiRelationType;
    /**
     * The shown conflicts
     */
    public conflicts = new Array<Conflict>();
}

export const schemes = {
    namespaced: true,
    state: new SchemesState(),
    mutations: {
        /**
         * Add a conflict
         */
        addConflict(state: SchemesState, conflict: Conflict): void {
            state.conflicts.unshift(conflict);
        },
        /**
         * Remove a conflict
         */
        removeConflict(state: SchemesState, conflict: Conflict): void {
            state.conflicts = state.conflicts.filter((c) => c !== conflict);
        },
        /**
         * Update a label
         */
        updateLabel(state: SchemesState, label: ApiLabel): void {
            state.labels = state.labels.map((l) => (l.id == label.id ? label : l));
        },
        /**
         * Update a relation
         */
        updateRelation(state: SchemesState, relation: ApiRelationType): void {
            state.relations = state.relations.map((r) => (r.id == relation.id ? relation : r));
        },
        /**
         * Set the labels
         */
        setLabels(state: SchemesState, labels: Array<ApiLabel>): void {
            state.labels = labels;
        },
        /**
         * Set the labels
         */
        setRelations(state: SchemesState, relations: Array<ApiRelationType>): void {
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
        selectRelation(state: SchemesState, relation: ApiRelationType): void {
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
        /**
         * Update a label
         */
        async updateLabel(context: ActionContext<SchemesState, RootState>, label: ApiLabel): Promise<void> {
            context.commit("updateLabel", label);
            context.commit("addConflict", new Conflict("Label changed!", "This lead to a conflict in 42 nodes."));
        },
        /**
         * Update a relation
         */
        async updateRelation(
            context: ActionContext<SchemesState, RootState>,
            relation: ApiRelationType,
        ): Promise<void> {
            context.commit("updateRelation", relation);
            context.commit("addConflict", new Conflict("Relation changed!", "This lead to a conflict in 420 nodes."));
        },
    },
};
