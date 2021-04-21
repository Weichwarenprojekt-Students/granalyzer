import { InspectorAttribute } from "@/modules/inspector/models/InspectorAttribute";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { GET, isUnexpected, PUT } from "@/utility";
import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";
import ApiLabel from "@/models/data-scheme/ApiLabel";
import ApiNode from "@/models/data-scheme/ApiNode";
import ApiRelation from "@/models/data-scheme/ApiRelation";
import { ApiRelationType } from "@/models/data-scheme/ApiRelationType";

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
     * The type
     */
    public type?: ApiLabel | ApiRelationType;
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
            // Clear the attribute-items array
            state.attributes = new Array<InspectorAttribute>();

            // Set the shown element
            state.element = payload.item;
            if (payload.type) state.type = payload.type;

            // Fill attributes from node and label data
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
    },
    actions: {
        /**
         * Set the clicked node
         */
        async selectNode(context: ActionContext<InspectorState, RootState>, uuid?: string): Promise<void> {
            if (!uuid) return;

            // Fetch node data
            let result = await GET(`/api/nodes/${uuid}`);
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
            let result = await GET(`/api/relations/${uuid}`);
            if (isUnexpected(result)) return;
            const relation: ApiRelation = await result.json();

            // Fetch scheme for the type of this relation
            result = await GET(`/api/data-scheme/relation/${relation.type}`);
            if (isUnexpected(result)) return;
            const type: ApiRelationType = await result.json();

            context.commit("setAttributes", { item: Object.assign(new ApiRelation(), relation), type });
        },
        /**
         * Update a label
         */
        async updateLabel(context: ActionContext<InspectorState, RootState>, node: ApiNode): Promise<void> {
            const result = await PUT(`/api/nodes/${node.nodeId}`, JSON.stringify(node));
            if (isUnexpected(result)) return;
            context.commit("setAttributes", { item: Object.assign(new ApiNode(), await result.json()) });
        },
        /**
         * Update a relation
         */
        async updateRelation(context: ActionContext<InspectorState, RootState>, relation: ApiRelation): Promise<void> {
            const result = await PUT(`/api/relations/${relation.relationId}`, JSON.stringify(relation));
            if (isUnexpected(result)) return;
            context.commit("setAttributes", { item: Object.assign(new ApiRelation(), await result.json()) });
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
