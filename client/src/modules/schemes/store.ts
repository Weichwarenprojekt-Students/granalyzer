import ApiLabel from "@/models/data-scheme/ApiLabel";
import { ApiRelationType } from "@/models/data-scheme/ApiRelationType";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { DELETE, GET, POST, PUT } from "@/utility";
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
     * True if the editor is currently creating a label/relation
     */
    public createMode = false;
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
            state.createMode = false;
            state.selectedLabel = label;
            state.selectedRelation = undefined;
        },
        /**
         * Select a relation
         */
        selectRelation(state: SchemesState, relation: ApiRelationType): void {
            state.createMode = false;
            state.selectedLabel = undefined;
            state.selectedRelation = relation;
        },
        /**
         * Initialize creation of a label
         */
        initLabelCreation(state: SchemesState): void {
            state.createMode = true;
            state.selectedLabel = new ApiLabel();
            state.selectedRelation = undefined;
        },
        /**
         * Initialize creation of a relation type
         */
        initRelationCreation(state: SchemesState): void {
            state.createMode = true;
            state.selectedLabel = undefined;
            state.selectedRelation = new ApiRelationType();
        },
        /**
         * Add a label
         */
        addLabel(state: SchemesState, label: ApiLabel): void {
            state.selectedLabel = undefined;
            state.labels.push(label);
        },
        /**
         * Add a relation type
         */
        addRelation(state: SchemesState, relation: ApiRelationType): void {
            state.selectedRelation = undefined;
            state.relations.push(relation);
        },
        /**
         * Update a label
         */
        updateLabel(state: SchemesState, label: ApiLabel): void {
            state.labels = state.labels.map((l) => (l.name == label.name ? label : l));
            state.selectedLabel = label;
        },
        /**
         * Update a relation type
         */
        updateRelation(state: SchemesState, relation: ApiRelationType): void {
            state.relations = state.relations.map((r) => (r.name == relation.name ? relation : r));
            state.selectedRelation = relation;
        },
        /**
         * Delete a label
         */
        deleteLabel(state: SchemesState, label: ApiLabel): void {
            state.selectedLabel = undefined;
            state.labels = state.labels.filter((l) => l.name !== label.name);
        },
        /**
         * Delete a relation type
         */
        deleteRelation(state: SchemesState, relation: ApiRelationType): void {
            state.selectedRelation = undefined;
            state.relations = state.relations.filter((r) => r.name !== relation.name);
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
         * Create a label
         */
        async createLabel(context: ActionContext<SchemesState, RootState>, label: ApiLabel): Promise<void> {
            const res = await POST("/api/data-scheme/label", JSON.stringify(label));
            if (res.status === 201) context.commit("addLabel", await res.json());
        },
        /**
         * Create a relation type
         */
        async createRelation(
            context: ActionContext<SchemesState, RootState>,
            relation: ApiRelationType,
        ): Promise<void> {
            const res = await POST("/api/data-scheme/relation", JSON.stringify(relation));
            if (res.status === 201) context.commit("addRelation", await res.json());
        },
        /**
         * Update a label
         */
        async updateLabel(context: ActionContext<SchemesState, RootState>, label: ApiLabel): Promise<void> {
            const res = await PUT(`/api/data-scheme/label/${label.name}`, JSON.stringify(label));
            if (res.status === 200) context.commit("updateLabel", await res.json());
        },
        /**
         * Update a relation type
         */
        async updateRelation(
            context: ActionContext<SchemesState, RootState>,
            relation: ApiRelationType,
        ): Promise<void> {
            const res = await PUT(`/api/data-scheme/relation/${relation.name}`, JSON.stringify(relation));
            if (res.status === 200) context.commit("updateRelation", await res.json());
        },
        /**
         * Delete a label
         */
        async deleteLabel(context: ActionContext<SchemesState, RootState>): Promise<boolean> {
            if (!context.state.selectedLabel) return false;
            const res = await DELETE(`/api/data-scheme/label/${context.state.selectedLabel.name}`);
            if (res.status === 200) {
                context.commit("deleteLabel", context.state.selectedLabel);
                return true;
            }
            return false;
        },
        /**
         * Delete a relation type
         */
        async deleteRelation(context: ActionContext<SchemesState, RootState>): Promise<boolean> {
            if (!context.state.selectedRelation) return false;
            const res = await DELETE(`/api/data-scheme/relation/${context.state.selectedRelation.name}`);
            if (res.status === 200) {
                context.commit("deleteRelation", context.state.selectedRelation);
                return true;
            }
            return false;
        },
    },
};