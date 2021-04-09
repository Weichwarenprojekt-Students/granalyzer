import ApiNode from "@/modules/editor/models/ApiNode";
import ApiLabel from "@/modules/editor/models/ApiLabel";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { GET, getBrightness } from "@/utility";

export class InventoryState {
    /**
     * Replication of the overview item that is dragged into the diagram
     */
    public selectedNode?: ApiNode;

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

export const inventory = {
    namespaced: true,
    state: new InventoryState(),
    mutations: {
        /**
         * Set selected item
         */
        setSelectedNode(state: InventoryState, node?: ApiNode): void {
            state.selectedNode = node;
        },
        /**
         * Stores the nodes
         */
        storeNodes(state: InventoryState, nodes: ApiNode[]): void {
            state.nodes = nodes;
        },
        /**
         * Extend the existing nodes
         */
        extendNodes(state: InventoryState, nodes: ApiNode[]): void {
            state.nodes.push(...nodes);
        },
        /**
         * Store the labels and create a color map for the label colors
         * with the matching font colors
         */
        storeLabels(state: InventoryState, labels: ApiLabel[]): void {
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
            context: ActionContext<InventoryState, RootState>,
            filter: { userInput: string; labelsToFilterBy: Array<string> },
        ): Promise<void> {
            const resNodes = await GET("/api/nodes?limit=50");
            const resLabels = await GET("/api/data-scheme/label");

            if (filter) {
                console.log("Load Inventory: " + filter.userInput); // TODO :: Load new labels with filter
                console.log(filter.labelsToFilterBy);
            }

            if (resLabels.status === 200 && resNodes.status === 200) {
                context.commit("storeLabels", await resLabels.json());
                context.commit("storeNodes", await resNodes.json());
            }
        },
        /**
         * Extend the nodes
         */
        async extendNodes(
            context: ActionContext<InventoryState, RootState>,
            filter: { userInput: string; labelsToFilterBy: Array<string> },
        ): Promise<void> {
            if (filter) {
                console.log("Extend Inventory: " + filter.userInput); // TODO :: Consider filter when extending
                console.log(filter.labelsToFilterBy);
            }

            const resNodes = await GET(`/api/nodes?limit=50&offset=${context.state.nodes.length}`);
            if (resNodes.status === 200) context.commit("extendNodes", await resNodes.json());
        },
    },
    getters: {
        /**
         * @return True if the nodes and the labels are loaded
         */
        nodesReady(state: InventoryState): boolean {
            return state.nodes.length > 0 && state.labels.length > 0;
        },
    },
};
