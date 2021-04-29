import ApiLabel from "@/models/data-scheme/ApiLabel";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { GET, isUnexpected } from "@/utility";
import { ApiDatatype } from "@/models/data-scheme/ApiDatatype";
import ApiNode from "@/models/data-scheme/ApiNode";
import { HeatMapAttribute } from "@/modules/editor/modules/heatmap/models/HeatMapAttribute";

export class HeatMapState {
    /**
     * The labels of the diagram
     */
    public labels: ApiLabel[] = [];

    /**
     * Affected nodes by label
     */
    public affectedNodesByLabel = new Map<string, ApiNode[]>();
}

async function fetchNode(uuid: string): Promise<ApiNode | undefined> {
    // Fetch node data
    const result = await GET(`/api/nodes/${uuid}`);
    if (isUnexpected(result)) return;
    return result.json();
}

export const heatMap = {
    namespaced: true,
    state: new HeatMapState(),
    mutations: {
        /**
         * set the active labels of the diagram with number attributes
         */
        setHeatLabels(state: HeatMapState, labels: ApiLabel[]): void {
            labels.forEach((label) => {
                label.attributes = label.attributes.filter((attr) => attr.datatype == ApiDatatype.NUMBER);
            });
            state.labels = labels;
        },
    },
    actions: {
        /**
         * get all labels which are in the diagram
         * @param context
         */
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

        /**
         * Return the nodes affected by the heat map attribute
         */
        async fetchAffectedNodes(
            context: ActionContext<HeatMapState, RootState>,
            payload: HeatMapAttribute,
        ): Promise<ApiNode[]> {
            const fetchNodePromises = [];

            // Return nodes if already stored in map
            if (context.state.affectedNodesByLabel.has(payload.labelName))
                return context.state.affectedNodesByLabel.get(payload.labelName) as ApiNode[];

            if (!context.rootState.editor?.graphEditor?.graphHandler) return [];

            // Fetch all needed nodes from the backend
            for (const node of context.rootState.editor?.graphEditor?.graphHandler.nodes) {
                if (node.nodeInfo.label === payload.labelName) {
                    fetchNodePromises.push(fetchNode(node.nodeInfo.ref.uuid));
                }
            }

            // Return the affected nodes
            const affectedNodes: ApiNode[] = await (await Promise.allSettled(fetchNodePromises))
                .filter((promise) => promise.status === "fulfilled")
                .map((promise) => (promise as PromiseFulfilledResult<ApiNode>).value);

            // Store the nodes
            context.state.affectedNodesByLabel.set(payload.labelName, affectedNodes);

            return affectedNodes;
        },
    },
    getters: {},
};
