import ApiLabel from "@/models/data-scheme/ApiLabel";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import {GET, getBrightness, isUnexpected} from "@/utility";
import { ApiDatatype } from "@/models/data-scheme/ApiDatatype";
import ApiNode from "@/models/data-scheme/ApiNode";
import { HeatMapAttribute } from "@/modules/editor/modules/heatmap/models/HeatMapAttribute";
import {HeatMapUtils} from "@/modules/editor/modules/heatmap/controls/HeatMapUtils";

export class HeatMapState {
    /**
     * The labels of the diagram
     */
    public labels: ApiLabel[] = [];

    /**
     * Affected nodes by label
     */
    public affectedNodesByLabel = new Map<string, ApiNode[]>();

    public heatMapUtils = new HeatMapUtils();
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
                    fetchNodePromises.push(context.state.heatMapUtils.fetchNode(node.nodeInfo.ref.uuid));
                }
            }

            // Return the affected nodes
            const affectedNodes: ApiNode[] = await (await Promise.allSettled(fetchNodePromises))
                .filter((promise) => promise.status === "fulfilled")
                .map((promise) => (promise as PromiseFulfilledResult<ApiNode>).value);

            // Store the nodes
            context.state.affectedNodesByLabel.set(payload.labelName, affectedNodes);

            console.log("affected Nodes", affectedNodes);
            return affectedNodes;
        },

        /**
         * Reset the color of all nodes matching the given label
         */
        async resetHeatmapColor(context: ActionContext<HeatMapState, RootState>, heatMapAttribute: HeatMapAttribute): Promise<void> {
            const graphHandler = context.rootState.editor?.graphEditor?.graphHandler;
            if (!graphHandler) return;
            for (const node of graphHandler.nodes) {
                if (node.nodeInfo.label === heatMapAttribute.labelName) {
                    node.jointElement.attr("body/fill", node.nodeInfo.color);
                    node.jointElement.attr("label/fill", getBrightness(node.nodeInfo.color) > 170 ? "#333" : "#FFF");
                }
            }
        },

        /**
         * Sets the the color of all nodes matching the given label name
         */
        async setHeatmapColor(context: ActionContext<HeatMapState, RootState>, heatMapAttribute: HeatMapAttribute): Promise<void> {
            const graphHandler = context.rootState.editor?.graphEditor?.graphHandler;

            // Get all nodes affected by the heatmap selection
            const affectedNodes: ApiNode[] = await context.dispatch(
                "fetchAffectedNodes",
                heatMapAttribute,
            );
            console.log("AN:", affectedNodes);
            if (!graphHandler) return;
            for (const node of graphHandler.nodes) {
                // Filter all the nodes affected by the heatmap label name
                if (node.nodeInfo.label === heatMapAttribute.labelName) {
                    const nodeValue = affectedNodes.filter(
                        (affectedNode) => affectedNode.nodeId === node.nodeInfo.ref.uuid,
                    )[0].attributes[heatMapAttribute.selectedAttributeName as string];

                    // Get new color from gradient
                    const newColor =
                        heatMapAttribute.selectedAttributeName && nodeValue != undefined
                            ? context.state.heatMapUtils.getLinearColor(
                            heatMapAttribute.from ?? 0,
                            heatMapAttribute.to ?? 0,
                            parseFloat(nodeValue.toString()),
                            )
                            : node.nodeInfo.color;

                    // Set new color to node
                    node.jointElement.attr("body/fill", newColor);
                    node.jointElement.attr("label/fill", getBrightness(newColor) > 170 ? "#333" : "#FFF");
                }
            }
            // Save the heatmap attribute to be serialized
            graphHandler.setHeatMapAttribute(heatMapAttribute);
        },
    },
    getters: {},
};
