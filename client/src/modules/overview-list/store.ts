import { ActionContext } from "vuex";
import ApiNode from "@/models/data-scheme/ApiNode";
import ApiLabel from "@/models/data-scheme/ApiLabel";
import { GET, getFontColor, isUnexpected } from "@/utility";
import { RootState } from "@/store";
import { NodeFilter } from "@/modules/overview-list/models/NodeFilter";

export class OverviewState {
    /**
     * Nodes in the customer db
     */
    public nodes = new Array<ApiNode>();

    /**
     * Labels in the customer db
     */
    public labels = new Array<ApiLabel>();

    /**
     * Label/Color, FontColor Map
     */
    public labelColor = new Map() as Map<string, { color: string; fontColor: string }>;

    /**
     * The overview filter (required for reload from inspector)
     */
    public filter = new NodeFilter();
}

/**
 * Generate a string from the filter parameters that can be used in backend requests
 *
 * @param filter Filter containing the name and labels to filter nodes by
 */
function generateFilterString(filter: NodeFilter): string {
    let filterString = "";
    if (filter) {
        filterString = "&nameFilter=" + filter.nameFilter;
        filter.labelFilter.forEach((label) => (filterString += "&labelFilter=" + label));
    }
    return filterString;
}

export const overview = {
    namespaced: true,
    state: new OverviewState(),
    mutations: {
        /**
         * Stores the nodes
         */
        storeNodes(state: OverviewState, nodes: ApiNode[]): void {
            state.nodes = nodes;
        },

        /**
         * Extend the existing nodes
         */
        extendNodes(state: OverviewState, nodes: ApiNode[]): void {
            state.nodes.push(...nodes);
        },

        /**
         * Update the filter
         */
        updateFilter(state: OverviewState, filter: NodeFilter): void {
            if (filter) state.filter = filter;
        },

        /**
         * Store the labels and create a color map for the label colors
         * with the matching font colors
         */
        storeLabels(state: OverviewState, labels: ApiLabel[]): void {
            state.labels = labels;
            labels.forEach((label) => {
                // Add label color and the font color to the color map
                state.labelColor.set(label.name, {
                    color: label.color,
                    fontColor: getFontColor(label.color),
                });
            });
        },
    },
    actions: {
        /**
         * Loads the labels and the first load of nodes
         */
        async loadLabelsAndNodes(context: ActionContext<OverviewState, RootState>, filter: NodeFilter): Promise<void> {
            // Generate the filter string
            context.commit("updateFilter", filter);
            const filterString = generateFilterString(context.state.filter);

            // Get the nodes and labels
            const resNodes = await GET(`/api/nodes?limit=50${filterString}`);
            const resLabels = await GET("/api/data-scheme/label");
            if (resLabels.status === 200 && resNodes.status === 200) {
                context.commit("storeLabels", await resLabels.json());
                context.commit("storeNodes", await resNodes.json());
                return;
            }
            // Check if everything was fine
            isUnexpected(resLabels);
            isUnexpected(resNodes);
        },

        /**
         * Extend the nodes
         */
        async extendNodes(context: ActionContext<OverviewState, RootState>, filter: NodeFilter): Promise<void> {
            // Generate the filter string
            context.commit("updateFilter", filter);
            const filterString = generateFilterString(context.state.filter);

            // Get the nodes
            const resNodes = await GET(`/api/nodes?limit=50&offset=${context.state.nodes.length}${filterString}`);
            if (!isUnexpected(resNodes)) context.commit("extendNodes", await resNodes.json());
        },

        /**
         * Reload the nodes
         */
        async reloadNodes(context: ActionContext<OverviewState, RootState>): Promise<void> {
            const filterString = generateFilterString(context.state.filter);
            const resNodes = await GET(`/api/nodes?limit=${Math.max(context.state.nodes.length, 50)}${filterString}`);
            context.commit("storeNodes", await resNodes.json());
        },
    },
    getters: {
        /**
         * @return True if the nodes and the labels are loaded
         */
        nodesReady(state: OverviewState): boolean {
            return state.nodes.length > 0 && state.labels.length > 0;
        },
    },
};
