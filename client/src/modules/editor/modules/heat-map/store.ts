import ApiLabel from "@/models/data-scheme/ApiLabel";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { allFulfilledPromises, deepCopy, GET, isUnexpected } from "@/utility";
import { ApiDatatype } from "@/models/data-scheme/ApiDatatype";
import ApiNode from "@/models/data-scheme/ApiNode";
import { HeatConfig, HeatConfigType } from "@/modules/editor/modules/heat-map/models/HeatConfig";
import { DEFAULT_COLOR } from "@/modules/editor/modules/heat-map/utility";
import { ApiAttribute } from "@/models/data-scheme/ApiAttribute";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { HeatNumberConfig } from "@/modules/editor/modules/heat-map/models/HeatNumberConfig";
import { HeatEnumConfig } from "@/modules/editor/modules/heat-map/models/HeatEnumConfig";
import { HeatColorConfig } from "@/modules/editor/modules/heat-map/models/HeatColorConfig";

export class HeatMapState {
    /**
     * The labels of the diagram
     */
    public labels: ApiLabel[] = [];
    /**
     * All labels from the data scheme
     */
    public labelCache: LabelCache = new LabelCache();
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

    /**
     * Clear the cache
     */
    public clear(): void {
        this.apiNodes.clear();
    }
}

class LabelCache {
    /**
     * Cached labels
     */
    private labels: Array<ApiLabel> = new Array<ApiLabel>();

    /**
     * Get all labels
     */
    public async get(): Promise<Array<ApiLabel>> {
        if (this.labels.length < 1) {
            const res = await GET("/api/data-scheme/label");
            this.labels = (await res.json()) as ApiLabel[];
        }

        return this.labels;
    }

    /**
     * Clear the cache
     */
    public clear(): void {
        this.labels = [];
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
         * Clear cache and active heat configs
         */
        resetHeatMap(state: RootState): void {
            state.editor?.heatMap?.nodeCache.clear();
            state.editor?.heatMap?.labelCache.clear();
            state.editor?.graphEditor?.graphHandler?.heatConfigs.clear();
        },
    },
    actions: {
        /**
         * Update heat map
         */
        async updateHeatMap(context: ActionContext<HeatMapState, RootState>): Promise<void> {
            await context.dispatch("updateHeatLabels");
            await context.dispatch("updateHeatColors");
        },
        /**
         * Get all labels which are in the diagram
         */
        async updateHeatLabels(context: ActionContext<HeatMapState, RootState>): Promise<void> {
            const allLabels = await context.state.labelCache.get();
            const editorLabels: Set<string> = context.rootGetters["editor/labels"];

            context.commit(
                "setHeatLabels",
                allLabels.filter((lab) => editorLabels.has(lab.name)),
            );
        },
        /**
         * Init the heat configs
         */
        async initHeatMap(context: ActionContext<HeatMapState, RootState>): Promise<void> {
            const graphHandler = context.rootState.editor?.graphEditor?.graphHandler;
            if (!graphHandler) return;

            let labelName: string, heatConfig: HeatConfig;
            for ([labelName, heatConfig] of graphHandler.heatConfigs) {
                const label = context.state.labels.find((lab) => lab.name === labelName);
                const attribute = label?.attributes.find((attr) => attr.name === heatConfig.attrName);

                // If label or attribute don't exist, delete the config
                if (!label || !attribute) {
                    context.commit("editor/deleteHeatConfig", labelName, { root: true });
                    continue;
                }

                // For enums check if the values have changed in the data scheme
                if (heatConfig.type === HeatConfigType.ENUM) {
                    // Generate symmetric difference between enum values
                    const configSet = new Set((heatConfig as HeatEnumConfig).values);
                    const attrSet = new Set(attribute.config);
                    if (
                        [...configSet, ...attrSet].filter((x) => {
                            return !(attrSet.has(x) && configSet.has(x));
                        }).length !== 0
                    ) {
                        // If they differ, generate new heat config for this attribute
                        const newHeatConfig = await context.dispatch("newHeatConfig", {
                            labelName,
                            attribute,
                            graphHandler,
                        });
                        if (newHeatConfig)
                            // If the attribute could be created, use it
                            context.commit(
                                "editor/setHeatConfig",
                                { label: labelName, config: heatConfig },
                                { root: true },
                            );
                        // If it couldn't, just delete the previous one
                        else context.commit("editor/deleteHeatConfig", labelName, { root: true });
                    }
                }
            }

            // Update colors of heatmap
            await context.dispatch("updateHeatColors");
        },
        /**
         * Set the heat config for a label
         */
        async setHeatConfig(
            context: ActionContext<HeatMapState, RootState>,
            { labelName, attributeName }: { labelName: string; attributeName: string },
        ): Promise<void> {
            // Get label model
            const label = context.state.labels.find((lab) => lab.name === labelName);
            if (!label) {
                context.commit("editor/deleteHeatConfig", labelName, { root: true });
                return;
            }

            // Get attribute model and graph handler
            const attribute = label.attributes.find((attr: ApiAttribute) => attr.name === attributeName);
            const graphHandler: GraphHandler | undefined = context.rootState.editor?.graphEditor?.graphHandler;
            if (attribute == null || !graphHandler) {
                context.commit("editor/deleteHeatConfig", labelName, { root: true });
                return;
            }

            // If a valid heat config was passed, use it
            const existingHeatConf = context.rootState.editor?.graphEditor?.graphHandler?.heatConfigs.get(labelName);
            if (existingHeatConf && existingHeatConf.attrName === attributeName) return;

            // Else create a new heat config
            const newHeatConfig = await context.dispatch("newHeatConfig", { labelName, attribute, graphHandler });
            if (!newHeatConfig) {
                context.commit("editor/deleteHeatConfig", labelName, { root: true });
                return;
            }

            // Set the new heat config
            context.commit("editor/setHeatConfig", { label: labelName, config: newHeatConfig }, { root: true });

            // Trigger update
            await context.dispatch("updateHeatColors");
        },
        /**
         * Generate a new heat config object
         */
        async newHeatConfig(
            context: ActionContext<HeatMapState, RootState>,
            {
                labelName,
                attribute,
                graphHandler,
            }: { labelName: string; attribute: ApiAttribute; graphHandler: GraphHandler },
        ): Promise<HeatConfig | undefined> {
            switch (attribute.datatype) {
                case HeatConfigType.NUMBER: {
                    // Get all nodes in the diagram for determining min and max values
                    const nodes = (
                        await allFulfilledPromises(
                            [...graphHandler.nodes]
                                .filter((node) => node.info.label === labelName)
                                .map((node) => context.state.nodeCache.fetch(node.reference.uuid)),
                        )
                    ).filter((node): node is ApiNode => !!node);

                    return new HeatNumberConfig(attribute.name, nodes);
                }
                case HeatConfigType.ENUM: {
                    // Get the possible enum values
                    const enumValues: Array<string> | undefined = attribute.config;
                    if (!enumValues) return;

                    return new HeatEnumConfig(attribute.name, deepCopy(enumValues));
                }
                case HeatConfigType.COLOR:
                    return new HeatColorConfig(attribute.name);
            }
        },
        /**
         * Delete active heat config for labels
         */
        async deleteHeatConfig(context: ActionContext<HeatMapState, RootState>, label: string): Promise<void> {
            context.commit("editor/deleteHeatConfig", label, { root: true });
            await context.dispatch("updateHeatColors");
        },
        /**
         * Set colors of the heat map according to the current heat configs
         */
        async updateHeatColors(context: ActionContext<HeatMapState, RootState>): Promise<void> {
            const graphHandler = context.rootState.editor?.graphEditor?.graphHandler;

            // Don't color nodes if heat map is disabled
            if (!graphHandler || graphHandler.heatConfigs.size === 0) {
                await context.dispatch("resetHeatColors");
                return;
            }

            for (const node of graphHandler.nodes) {
                // Get the config for the label of the node
                const config = graphHandler.heatConfigs.get(node.info.label);

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
