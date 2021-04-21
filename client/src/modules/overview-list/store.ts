import { ActionContext } from "vuex";
import ApiNode from "@/models/data-scheme/ApiNode";
import ApiLabel from "@/models/data-scheme/ApiLabel";
import { GET, getBrightness, isUnexpected } from "@/utility";
import { RootState } from "@/store";

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
}

/**
 * Generate a string from the filter parameters that can be used in backend requests
 *
 * @param filter Filter containing the name and labels to filter nodes by
 */
function generateFilterString(filter: { nameFilter: string; selectedLabels: Array<string> }): string {
    let filterString = "";
    if (filter) {
        filterString = "&nameFilter=" + filter.nameFilter;
        filter.selectedLabels.forEach((label) => (filterString += "&labelFilter=" + label));
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
         * Store the labels and create a color map for the label colors
         * with the matching font colors
         */
        storeLabels(state: OverviewState, labels: ApiLabel[]): void {
            state.labels = labels;
            labels.forEach((label) => {
                // Set the right font color depending on the brightness
                const brightness = getBrightness(label.color);
                const font = brightness > 170 ? "#333333" : "#FFFFFF";

                // Add label color and the font color to the color map
                state.labelColor.set(label.name, {
                    color: label.color,
                    fontColor: font,
                });
            });
        },
    },
    actions: {
        /**
         * Loads the labels and the first load of nodes
         */
        async loadLabelsAndNodes(
            context: ActionContext<OverviewState, RootState>,
            filter: { nameFilter: string; selectedLabels: Array<string> },
        ): Promise<void> {
            const filterString = generateFilterString(filter);

            const resNodes = await GET(`/api/nodes?limit=50${filterString}`);
            const resLabels = await GET("/api/data-scheme/label");

            if (resLabels.status === 200 && resNodes.status === 200) {
                context.commit("storeLabels", await resLabels.json());
                context.commit("storeNodes", await resNodes.json());
            }
        },
        /**
         * Extend the nodes
         */
        async extendNodes(
            context: ActionContext<OverviewState, RootState>,
            filter: { nameFilter: string; selectedLabels: Array<string> },
        ): Promise<void> {
            const filterString = generateFilterString(filter);

            const resNodes = await GET(`/api/nodes?limit=50&offset=${context.state.nodes.length}${filterString}`);
            if (!isUnexpected(resNodes)) context.commit("extendNodes", await resNodes.json());
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
