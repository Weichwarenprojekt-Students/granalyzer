import { InspectorAttribute } from "@/modules/inspector/models/InspectorAttribute";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { GET, PUT } from "@/utility";
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
     * The different types
     */
    public types?: Array<ApiLabel | ApiRelationType>;
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
            payload: { item: ApiNode | ApiRelation; types: Array<ApiLabel | ApiRelationType> },
        ): void {
            // Clear the attribute-items array
            state.attributes = new Array<InspectorAttribute>();

            // Set the shown element
            state.element = payload.item;
            if (payload.types) state.types = payload.types;

            // Fill attributes from node and label data
            const schemeName = state.element instanceof ApiNode ? state.element.label : state.element.type;
            const scheme = state.types?.find((scheme) => scheme.name === schemeName);
            state.attributes =
                scheme?.attributes.map(
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
            if (result.status != 200) return;
            const node: ApiNode = await result.json();

            // Fetch scheme for the label of this node
            result = await GET(`/api/data-scheme/label`);
            if (result.status != 200) return;
            const types: Array<ApiLabel> = await result.json();

            context.commit("setAttributes", { item: Object.assign(new ApiNode(), node), types });
        },
        /**
         * Set the clicked relation
         */
        async selectRelation(context: ActionContext<InspectorState, RootState>, uuid?: string): Promise<void> {
            if (!uuid) return;

            // Fetch the relation data
            let result = await GET(`/api/relations/${uuid}`);
            if (result.status != 200) return;
            const relation: ApiRelation = await result.json();

            // Fetch scheme for the type of this relation
            result = await GET(`/api/data-scheme/relation`);
            if (result.status != 200) return;
            const types: Array<ApiRelationType> = await result.json();

            context.commit("setAttributes", { item: Object.assign(new ApiRelation(), relation), types });
        },
        /**
         * Update a label
         */
        async updateLabel(context: ActionContext<InspectorState, RootState>, node: ApiNode): Promise<void> {
            // TODO: Default toast for every unexpected result
            const result = await PUT(`/api/nodes/${node.nodeId}`, JSON.stringify(node));
            if (result.status != 200) return;
            context.commit("setAttributes", { item: Object.assign(new ApiNode(), await result.json()) });
        },
        /**
         * Update a relation
         */
        async updateRelation(context: ActionContext<InspectorState, RootState>, relation: ApiRelation): Promise<void> {
            const result = await PUT(`/api/relations/${relation.relationId}`, JSON.stringify(relation));
            if (result.status != 200) return;
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
