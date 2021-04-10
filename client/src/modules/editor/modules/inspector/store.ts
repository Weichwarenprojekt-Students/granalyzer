import { InspectorAttribute } from "@/modules/editor/modules/inspector/models/InspectorAttribute";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/models/Relation";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { GET } from "@/utility";
import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";
import ApiLabel from "@/models/data-scheme/ApiLabel";
import ApiNode from "@/models/data-scheme/ApiNode";

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
         * Set the inspector items
         */
        setInspectorItems(state: InspectorState, payload: { node: ApiNode; label: ApiLabel }) {
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
    },

    actions: {
        /**
         * Set the clicked node
         */
        async viewNodeInInspector(context: ActionContext<InspectorState, RootState>, uuid?: string): Promise<void> {
            // Fetch the node data
            let result = await GET(`/api/nodes/${uuid}`);
            if (result.status != 200) return;
            const node: ApiNode = await result.json();

            // TODO: After backend refactor: Only fetch relevant scheme for specific label
            // Get data scheme for the label of this node
            result = await GET("/api/data-scheme/label");
            if (result.status != 200) return;

            // Get the scheme for the current label only!
            let label: Array<ApiLabel> = await result.json();
            label = label.filter((label) => {
                return label.name === node.label;
            });
            if (label.length != 1) return;

            context.commit("setInspectorItems", { node, label: label[0] });
        },

        /**
         * Set the clicked relation
         */
        viewRelationInInspector(context: ActionContext<InspectorState, RootState>, relation: Relation): void {
            // TODO: Implement inspector for relations after backend refactor
        },
    },
};
