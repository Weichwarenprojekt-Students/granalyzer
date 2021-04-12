import ApiNode from "@/modules/editor/models/ApiNode";

export class InventoryState {
    /**
     * Replication of the overview item that is dragged into the diagram
     */
    public selectedNode?: ApiNode;
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
    },
};
