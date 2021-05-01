import ApiLabel from "@/models/data-scheme/ApiLabel";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { allFulfilledPromises, GET } from "@/utility";
import { ApiDatatype } from "@/models/data-scheme/ApiDatatype";
import ApiNode from "@/models/data-scheme/ApiNode";
import { HeatMapAttribute } from "@/modules/editor/modules/heatmap/models/HeatMapAttribute";
import { HeatMapUtils } from "@/modules/editor/modules/heatmap/controls/HeatMapUtils";
import { NodeInfo } from "@/modules/editor/modules/graph-editor/controls/nodes/models/NodeInfo";
import { Node } from "@/modules/editor/modules/graph-editor/controls/nodes/Node";
import { DEFAULT_COLOR } from "@/shared/NodeShapes";

const unaffectedNodeColor = "#aaa";

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
                label.attributes = label.attributes.filter(
                    (attr) => attr.datatype === ApiDatatype.NUMBER || attr.datatype === ApiDatatype.ENUM,
                );
            });
            state.labels = labels;
        },

        /**
         * Appends a new node to the list of all affected nodes by label
         */
        addAffectedNode(state: HeatMapState, node: ApiNode): void {
            let affectedNodesByLabel = state.affectedNodesByLabel.get(node.label);
            affectedNodesByLabel ? affectedNodesByLabel.push(node) : (affectedNodesByLabel = [node]);
            state.affectedNodesByLabel.set(node.label, affectedNodesByLabel);
        },

        /**
         * Drops all nodes with the given label from the affected nodes by label map
         */
        dropAffectedLabel(state: HeatMapState, labelName: string): void {
            state.affectedNodesByLabel.delete(labelName);
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
                labels.push((await res.json()) as ApiLabel);
            }
            context.commit("setHeatLabels", labels);
        },

        /**
         * Return the nodes affected by the heat map attribute
         */
        async fetchAffectedNodes(
            context: ActionContext<HeatMapState, RootState>,
            heatMapAttribute: HeatMapAttribute,
        ): Promise<ApiNode[]> {
            const fetchNodePromises = [];

            // Return nodes if already stored in map
            if (context.state.affectedNodesByLabel.has(heatMapAttribute.labelName))
                return context.state.affectedNodesByLabel.get(heatMapAttribute.labelName) as ApiNode[];

            if (!context.rootState.editor?.graphEditor?.graphHandler) return [];

            // Fetch all needed nodes from the backend
            for (const node of context.rootState.editor?.graphEditor?.graphHandler.nodes) {
                if (node.info.label === heatMapAttribute.labelName) {
                    fetchNodePromises.push(context.state.heatMapUtils.fetchNode(node.reference.uuid));
                }
            }

            // Return the affected nodes
            const affectedNodes: ApiNode[] = (await allFulfilledPromises(fetchNodePromises)).filter(
                (node): node is ApiNode => !!node,
            );

            // Store the nodes
            context.state.affectedNodesByLabel.set(heatMapAttribute.labelName, affectedNodes);

            return affectedNodes;
        },

        /**
         * Reset the color of all nodes matching the given label
         */
        async resetHeatmapColor(
            context: ActionContext<HeatMapState, RootState>,
            heatMapAttribute: HeatMapAttribute,
        ): Promise<void> {
            const graphHandler = context.rootState.editor?.graphEditor?.graphHandler;
            if (!graphHandler) return;

            // Set all nodes color back to the stored one
            for (const node of graphHandler.nodes) {
                if (node.info.label === heatMapAttribute.labelName) {
                    context.state.heatMapUtils.setNodeColor(
                        node.joint,
                        // TODO: apply correct styling / color
                        node.info.color ?? node.info.labelColor ?? DEFAULT_COLOR,
                    );
                }
            }

            graphHandler.dropHeatMapAttribute(heatMapAttribute);
            context.commit("dropAffectedLabel", heatMapAttribute.labelName);

            if (graphHandler.getActiveHeatMapLabels().length === 0) {
                await context.dispatch("setUnaffectedNodesColor");
            }
        },

        /**
         * Sets the the color of all nodes matching the given label name
         */
        async setHeatmapColor(
            context: ActionContext<HeatMapState, RootState>,
            heatMapAttribute: HeatMapAttribute,
        ): Promise<void> {
            const graphHandler = context.rootState.editor?.graphEditor?.graphHandler;

            // Get all nodes affected by the heatmap selection
            const affectedNodes: ApiNode[] = await context.dispatch("fetchAffectedNodes", heatMapAttribute);
            if (!graphHandler) return;
            for (const node of graphHandler.nodes) {
                // Filter all the nodes affected by the heatmap label name
                if (node.info.label === heatMapAttribute.labelName) {
                    const nodeValue: string = affectedNodes
                        .filter((affectedNode) => affectedNode.nodeId === node.info.ref.uuid)[0]
                        .attributes[heatMapAttribute.selectedAttribute?.name as string]?.toString();

                    // Get new color from gradient
                    const newColor =
                        heatMapAttribute.selectedAttribute && nodeValue != undefined
                            ? context.state.heatMapUtils.getLinearColor(
                                  heatMapAttribute.from ?? 0,
                                  heatMapAttribute.to ?? 0,
                                  context.state.heatMapUtils.parseNodeValueByDataType(heatMapAttribute, nodeValue),
                              )
                            : unaffectedNodeColor;

                    // Set new color to node
                    context.state.heatMapUtils.setNodeColor(node.joint, newColor);
                }
            }
            // Save the heatmap attribute to be serialized
            graphHandler.setHeatMapAttribute(heatMapAttribute);

            await context.dispatch("setUnaffectedNodesColor", unaffectedNodeColor);
        },

        /**
         * If at least one heatmap is active, all other nodes should be colored grey
         */
        setUnaffectedNodesColor(
            context: ActionContext<HeatMapState, RootState>,
            color?: string,
        ): Promise<void> | undefined {
            const graphHandler = context.rootState.editor?.graphEditor?.graphHandler;
            if (!graphHandler) return;

            const heatMapLabels: string[] = graphHandler.getActiveHeatMapLabels();

            // Loop over all unaffected nodes and set the given color, or restore the saved if color not set
            for (const node of graphHandler.nodes) {
                if (!heatMapLabels.includes(node.info.label)) {
                    context.state.heatMapUtils.setNodeColor(
                        node.joint,
                        // TODO: apply correct styling / color
                        color ?? node.info.color ?? node.info.labelColor ?? DEFAULT_COLOR,
                    );
                }
            }
        },

        /**
         * Returns the heatmap attribute from the graph handler if set
         */
        getHeatMapAttribute(
            context: ActionContext<HeatMapState, RootState>,
            labelName: string,
        ): HeatMapAttribute | null {
            const graphHandler = context.rootState.editor?.graphEditor?.graphHandler;
            return !graphHandler ? null : graphHandler?.getHeatMapAttribute(labelName);
        },

        /**
         * Adjusts a added nodes color to match the heatmap settings
         */
        async addNode(context: ActionContext<HeatMapState, RootState>, nodeInfo: NodeInfo): Promise<void> {
            const graphHandler = context.rootState.editor?.graphEditor?.graphHandler;
            if (!graphHandler) return;

            // Exit if no heatmap is applied
            if (graphHandler?.getActiveHeatMapLabels().length == 0) return;

            // Get the matching heat map attribute
            const heatMapAttribute = graphHandler.getHeatMapAttribute(nodeInfo.label);
            if (!heatMapAttribute) return;

            // Get the drawn element from joint.js
            const jointNode = graphHandler.nodes.getByReference(nodeInfo.ref.uuid, nodeInfo.ref.index) as Node;

            // Get and add the specific node to the list of all affected nodes
            const apiNode = (await context.state.heatMapUtils.fetchNode(nodeInfo.ref.uuid)) as ApiNode;
            context.commit("addAffectedNode", apiNode);

            // Get the value of the nodes specific attribute which is selected for the heat map
            const nodeValue = apiNode.attributes[heatMapAttribute.selectedAttribute?.name as string].toString();

            // Determine the nodes new color
            const newColor = nodeValue
                ? context.state.heatMapUtils.getLinearColor(
                      heatMapAttribute.from ?? 0,
                      heatMapAttribute.to ?? 0,
                      context.state.heatMapUtils.parseNodeValueByDataType(heatMapAttribute, nodeValue),
                  )
                : unaffectedNodeColor;

            // Set new color to node
            context.state.heatMapUtils.setNodeColor(jointNode?.joint, newColor);
        },
    },
    getters: {},
};
