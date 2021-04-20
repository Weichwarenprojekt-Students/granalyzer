import { InspectorAttribute } from "@/modules/inspector/models/InspectorAttribute";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { GET } from "@/utility";
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
        setAttributesFromNode(state: InspectorState, payload: { node: ApiNode; label: ApiLabel }): void {
            // Clear the attribute-items array
            state.attributes = new Array<InspectorAttribute>();

            // Set the inspector display name
            state.element = payload.node;

            // Fill attributes from node and label data
            state.attributes = payload.label.attributes.map(
                (attribute: ApiAttribute) =>
                    new InspectorAttribute(
                        attribute.name,
                        payload.node.attributes[attribute.name] as string,
                        attribute.datatype,
                    ),
            );
        },
        /**
         * Set the inspector items for relations
         */
        setAttributesFromRelation(
            state: InspectorState,
            payload: { relation: ApiRelation; relType: ApiRelationType },
        ): void {
            // Clear the attribute-items array
            state.attributes = new Array<InspectorAttribute>();

            // Set the inspector display name
            state.element = payload.relation;

            // Fill attributes from relation and relation-type data
            state.attributes = payload.relType.attributes.map(
                (attribute) =>
                    new InspectorAttribute(
                        attribute.name,
                        payload.relation.attributes[attribute.name] as string,
                        attribute.datatype,
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
            let result = await GET(`/api/nodes/${uuid}`);
            if (result.status != 200) return;
            const node: ApiNode = await result.json();

            // Fetch scheme for the label of this node
            result = await GET(`/api/data-scheme/label/${node.label}`);
            if (result.status != 200) return;
            const label: ApiLabel = await result.json();

            context.commit("setAttributesFromNode", { node, label });
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
            result = await GET(`/api/data-scheme/relation/${relation.type}`);
            if (result.status != 200) return;
            const relType: ApiRelationType = await result.json();

            context.commit("setAttributesFromRelation", { relation, relType });
        },
    },
    getters: {
        /**
         * @return True if the inspector has data to show
         */
        isLoaded(state: InspectorState): boolean {
            return !!state.element;
        },
    },
};
