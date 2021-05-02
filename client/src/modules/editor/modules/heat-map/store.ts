import ApiLabel from "@/models/data-scheme/ApiLabel";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { deepCopy, GET, isUnexpected } from "@/utility";
import { ApiDatatype } from "@/models/data-scheme/ApiDatatype";
import ApiNode from "@/models/data-scheme/ApiNode";
import { HeatConfig } from "@/modules/editor/modules/heat-map/models/HeatConfig";
import { DEFAULT_COLOR } from "@/modules/editor/modules/heat-map/utility";

export class HeatMapState {
    /**
     * The labels of the diagram
     */
    public labels: ApiLabel[] = [];
    /**
     * The heat configurations for each label
     */
    public labelConfigs: Map<string, HeatConfig> = new Map<string, HeatConfig>();

    /**
     * Cache for storing node information
     */
    public nodeCache: NodeCache = new NodeCache();
}

class NodeCache {
    /**
     * The cached nodes
     */
    private apiNodes: Map<string, ApiNode> = new Map<string, ApiNode>();

    /**
     * Fetch a node by uuid
     *
     * @param uuid The uuid of the node
     */
    public async fetch(uuid: string): Promise<ApiNode | undefined> {
        // Look for the node in the cache
        const node = this.apiNodes.get(uuid);
        if (node) return node;

        // Get the node from the server
        const result = await GET(`/api/nodes/${uuid}`);
        if (isUnexpected(result, false)) return undefined;
        const newNode = (await result.json()) as ApiNode;
        if (newNode) this.apiNodes.set(uuid, newNode);
        return newNode;
    }
}

export const heatMap = {
    state: new HeatMapState(),
    mutations: {
        /**
         * set the active labels of the diagram with number attributes
         */
        setHeatLabels(state: HeatMapState, labels: ApiLabel[]): void {
            labels.forEach((label) => {
                label.attributes = label.attributes.filter(
                    (attr) =>
                        attr.datatype === ApiDatatype.NUMBER ||
                        attr.datatype === ApiDatatype.ENUM ||
                        attr.datatype === ApiDatatype.COLOR,
                );
            });
            state.labels = labels;
        },
        /**
         * Set an active heat config
         */
        setHeatConfig(state: HeatMapState, { label, config }: { label: string; config: HeatConfig }): void {
            state.labelConfigs.set(label, config);
        },
        /**
         * Delete active heat config for labels
         */
        deleteHeatConfig(state: HeatMapState, label: string): void {
            state.labelConfigs.delete(label);
        },
    },
    actions: {
        /**
         * Update heat map
         */
        async updateHeatMap(context: ActionContext<HeatMapState, RootState>): Promise<void> {
            await context.dispatch("getHeatLabels");
            await context.dispatch("updateHeatColors");
        },
        /**
         * Get all labels which are in the diagram
         */
        async getHeatLabels(context: ActionContext<HeatMapState, RootState>): Promise<void> {
            // TODO: refactor with cache
            const labels: ApiLabel[] = [];
            const getter = context.rootGetters["editor/labels"];
            for (const label of getter) {
                const res = await GET("/api/data-scheme/label/" + label);
                labels.push((await res.json()) as ApiLabel);
            }
            context.commit("setHeatLabels", labels);
        },
        /**
         * Set an active heat config
         */
        async setHeatConfig(
            context: ActionContext<HeatMapState, RootState>,
            payload: { label: string; config: HeatConfig },
        ): Promise<void> {
            context.commit("setHeatConfig", payload);
            await context.dispatch("updateHeatColors");
        },
        /**
         * Delete active heat config for labels
         */
        async deleteHeatConfig(context: ActionContext<HeatMapState, RootState>, label: string): Promise<void> {
            context.commit("deleteHeatConfig", label);
            await context.dispatch("updateHeatColors");
        },
        /**
         * Set colors of the heat map according to the current heat configs
         */
        async updateHeatColors(context: ActionContext<HeatMapState, RootState>): Promise<void> {
            // Don't color nodes if heat map is disabled
            if (context.state.labelConfigs.size === 0) {
                await context.dispatch("resetHeatColors");
                return;
            }

            const nodes = context.rootState.editor?.graphEditor?.graphHandler?.nodes;
            if (!nodes) return;

            for (const node of nodes) {
                // Get the config for the label of the node
                const config = context.state.labelConfigs.get(node.info.label);

                let color;
                if (config) {
                    // Set heat color according to the attribute
                    color = config.getColor(await context.state.nodeCache.fetch(node.reference.uuid));
                } else {
                    // Set grey because no config is specified
                    color = DEFAULT_COLOR;
                }

                // Create new styled node info
                const styledNodeInfo = deepCopy(node.info);
                styledNodeInfo.color = color;
                styledNodeInfo.borderColor = color;

                // Set the new temporary style
                node.updateStyle(styledNodeInfo);
            }
        },
        /**
         * Reset heat colors
         */
        async resetHeatColors(context: ActionContext<HeatMapState, RootState>): Promise<void> {
            const nodes = context.rootState.editor?.graphEditor?.graphHandler?.nodes;
            if (!nodes) return;

            for (const node of nodes) node.updateStyle(node.info);
        },
    },
    getters: {},
};
