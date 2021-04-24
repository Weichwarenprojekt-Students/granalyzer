import { InspectorAttribute } from "@/modules/inspector/models/InspectorAttribute";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { DELETE, GET, isUnexpected, POST, PUT } from "@/utility";
import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";
import ApiLabel from "@/models/data-scheme/ApiLabel";
import ApiNode from "@/models/data-scheme/ApiNode";
import ApiRelation from "@/models/data-scheme/ApiRelation";
import { ApiRelationType } from "@/models/data-scheme/ApiRelationType";
import i18n from "@/i18n";

export class InspectorState {
    /**
     *  The currently listed attribute items in inspector
     */
    public attributes = new Array<InspectorAttribute>();
    /**
     * The name of the currently displayed node or relation
     */
    public element?: ApiRelation | ApiNode;
    /**
     * The current type
     */
    public type?: ApiLabel | ApiRelationType;

    /**
     * The different labels (for creating)
     */
    public types?: Array<ApiLabel> = [];
}

export const inspector = {
    namespaced: true,
    state: new InspectorState(),
    mutations: {
        /**
         * Reset the current selection
         */
        resetSelection(state: InspectorState): void {
            state.attributes = [];
            state.element = undefined;
        },
        /**
         * Set the inspector items for nodes
         */
        setAttributes(
            state: InspectorState,
            payload: { item: ApiNode | ApiRelation; type: ApiLabel | ApiRelationType },
        ): void {
            // Set the shown element
            state.element = payload.item;
            if (!state.element) return;
            if (payload.type) state.type = payload.type;

            // Fill attributes from node and label data
            state.attributes = new Array<InspectorAttribute>();
            state.attributes =
                state.type?.attributes.map(
                    (attribute: ApiAttribute) =>
                        new InspectorAttribute(
                            attribute.name,
                            payload.item.attributes[attribute.name],
                            attribute.datatype,
                            !!payload.item.attributes[attribute.name],
                        ),
                ) ?? [];
        },
        /**
         * Select a new node
         */
        newNode(state: InspectorState, types: Array<ApiLabel>): void {
            // Create a new node
            state.element = new ApiNode(i18n.global.t("inspector.new"));
            state.types = types ?? [];
            state.element.label = "-";
            if (types.length <= 0) return;

            // Set default label
            state.element.label = types[0].name;
            state.attributes = types[0].attributes.map(
                (attribute: ApiAttribute) =>
                    new InspectorAttribute(
                        attribute.name,
                        attribute.defaultValue,
                        attribute.datatype,
                        attribute.mandatory,
                    ),
            );
        },
    },
    actions: {
        /**
         * Set the clicked node
         */
        async selectNode(context: ActionContext<InspectorState, RootState>, uuid?: string): Promise<void> {
            if (!uuid) return;

            // Fetch node data
            let result = await GET(`/api/nodes/${uuid}?includeDefaults=false`);
            if (isUnexpected(result)) return;
            const node: ApiNode = await result.json();

            // Fetch scheme for the label of this node
            result = await GET(`/api/data-scheme/label/${node.label}`);
            if (isUnexpected(result)) return;
            const type: ApiLabel = await result.json();

            context.commit("setAttributes", { item: Object.assign(new ApiNode(), node), type });
        },
        /**
         * Set the clicked relation
         */
        async selectRelation(context: ActionContext<InspectorState, RootState>, uuid?: string): Promise<void> {
            if (!uuid) return;

            // Fetch the relation data
            let result = await GET(`/api/relations/${uuid}?includeDefaults=false`);
            if (isUnexpected(result)) return;
            const relation: ApiRelation = await result.json();

            // Fetch scheme for the type of this relation
            result = await GET(`/api/data-scheme/relation/${relation.type}`);
            if (isUnexpected(result)) return;
            const type: ApiRelationType = await result.json();

            context.commit("setAttributes", { item: Object.assign(new ApiRelation(), relation), type });
        },
        /**
         * Update a node
         */
        async updateNode(context: ActionContext<InspectorState, RootState>, node: ApiNode): Promise<void> {
            const result = await PUT(`/api/nodes/${node.nodeId}`, JSON.stringify(node));
            if (isUnexpected(result)) return;
            context.commit("setAttributes", { item: Object.assign(new ApiNode(), await result.json()) });
            await context.dispatch("updateInspector");
        },
        /**
         * Update a relation
         */
        async updateRelation(context: ActionContext<InspectorState, RootState>, relation: ApiRelation): Promise<void> {
            const result = await PUT(`/api/relations/${relation.relationId}`, JSON.stringify(relation));
            if (isUnexpected(result)) return;
            context.commit("setAttributes", { item: Object.assign(new ApiRelation(), await result.json()) });
            await context.dispatch("updateInspector");
        },
        /**
         * Update a node
         */
        async deleteNode(context: ActionContext<InspectorState, RootState>, node: ApiNode): Promise<void> {
            const result = await DELETE(`/api/nodes/${node.nodeId}`);
            if (isUnexpected(result)) return;
            context.commit("setAttributes", {});
            await context.dispatch("updateInspector");
        },
        /**
         * Update a relation
         */
        async deleteRelation(context: ActionContext<InspectorState, RootState>, relation: ApiRelation): Promise<void> {
            const result = await DELETE(`/api/relations/${relation.relationId}`);
            if (isUnexpected(result)) return;
            context.commit("setAttributes", {});
            await context.dispatch("updateInspector");
        },
        /**
         * Create a label
         */
        async createNode(context: ActionContext<InspectorState, RootState>, node: ApiNode): Promise<void> {
            const result = await POST(`/api/nodes`, JSON.stringify(node));
            if (isUnexpected(result)) return;
            context.commit("setAttributes", { item: Object.assign(new ApiNode(), await result.json()) });
            await context.dispatch("updateInspector");
        },
        /**
         * Reload the shown inspector content
         */
        async updateInspector(context: ActionContext<InspectorState, RootState>): Promise<void> {
            await context.dispatch("inventory/loadNeighbors", undefined, { root: true });
            await context.dispatch("overview/reloadNodes", undefined, { root: true });
        },
        /**
         * Set a new node for creation
         */
        async newNode(context: ActionContext<InspectorState, RootState>): Promise<void> {
            const result = await GET(`/api/data-scheme/label`);
            if (isUnexpected(result)) return;
            context.commit("newNode", await result.json());
        },
    },
    getters: {
        /**
         * @return True if the inspector has data to show
         */
        isLoaded(state: InspectorState): boolean {
            return !!state.element;
        },
        /**
         * @return True if selected element is a label
         */
        isNode(state: InspectorState): boolean {
            return state.element instanceof ApiNode;
        },
        /**
         * @return True if the inspector is in create mode
         */
        createMode(state: InspectorState): boolean {
            return !(
                (state.element instanceof ApiRelation && !!state.element.relationId) ||
                (state.element instanceof ApiNode && !!state.element.nodeId)
            );
        },
        /**
         * @return True if the inspector is in create mode
         */
        getName(state: InspectorState): string {
            if (state.element instanceof ApiRelation) return state.element.type;
            else if (state.element instanceof ApiNode) return state.element.name;
            return "";
        },
    },
};
