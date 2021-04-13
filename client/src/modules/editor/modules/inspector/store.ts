import { InspectorAttribute } from "@/modules/editor/modules/inspector/models/InspectorAttribute";
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
     * Specifies if inspector is visible
     */
    public visible = false;
}

export const inspector = {
    state: new InspectorState(),
    mutations: {
        /**
         * Set visibility of inspector panel
         */
        setInspectorVisibility(state: InspectorState, visible: boolean): void {
            state.visible = visible;
        },

        /**
         * Set the inspector items for nodes
         */
        setInspectorNodeItems(state: InspectorState, payload: { node: ApiNode; label: ApiLabel }): void {
            // Clear the attribute-items array
            state.attributes = new Array<InspectorAttribute>();

            // Fill attributes from node and label data
            payload.label.attributes.forEach((attribute: ApiAttribute) => {
                state.attributes.push(
                    new InspectorAttribute(
                        attribute.name,
                        payload.node.attributes[attribute.name] as string,
                        attribute.datatype,
                    ),
                );
            });
        },

        /**
         * Set the inspector items for relations
         */
        setInspectorRelationItems(
            state: InspectorState,
            payload: { relation: ApiRelation; relType: ApiRelationType },
        ): void {
            // Clear the attribute-items array
            state.attributes = new Array<InspectorAttribute>();

            // Fill attributes from relation and relation-type data
            payload.relType.attributes.forEach((attribute) => {
                state.attributes.push(
                    new InspectorAttribute(
                        attribute.name,
                        payload.relation.attributes[attribute.name] as string,
                        attribute.datatype,
                    ),
                );
            });
        },
    },

    actions: {
        /**
         * Set the clicked node
         */
        async viewNodeInInspector(context: ActionContext<InspectorState, RootState>, uuid?: string): Promise<void> {
            if (!uuid) return;

            // Fetch node data
            let result = await GET(`/api/nodes/${uuid}`);
            if (result.status != 200) return;
            const node: ApiNode = await result.json();

            // Fetch scheme for the label of this node
            result = await GET(`/api/data-scheme/label/${node.label}`);
            if (result.status != 200) return;

            context.commit("setInspectorNodeItems", { node, label: await result.json() });
            context.commit("setInspectorVisibility", true);
        },

        /**
         * Set the clicked relation
         */
        async viewRelationInInspector(context: ActionContext<InspectorState, RootState>, uuid?: string): Promise<void> {
            if (!uuid) return;

            // Fetch the relation data
            let result = await GET(`/api/relations/${uuid}`);
            if (result.status != 200) return;
            const relation: ApiRelation = await result.json();

            // Fetch scheme for the type of this relation
            result = await GET(`/api/data-scheme/relation/${relation.type}`);
            if (result.status != 200) return;
            const relType: ApiRelationType = await result.json();

            context.commit("setInspectorRelationItems", { relation, relType });
            context.commit("setInspectorVisibility", true);
        },
    },
};
