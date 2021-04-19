import ApiNode from "@/models/data-scheme/ApiNode";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { GET } from "@/utility";
import ApiRelation from "@/models/data-scheme/ApiRelation";
import { RootObject } from "@/modules/inventory/modules/neighbor-view/models/RootObject";

export class InventoryState {
    /**
     * Replication of the overview item that currently selected
     */
    public selectedNode?: ApiNode;

    /**
     * Replication of the overview item that is dragged into the diagram
     */
    public draggedNode?: ApiNode;

    /**
     * First degree neighbors of the currently selected node
     */
    public neighbors = [] as Array<ApiNode>;

    /**
     * Relations for the currently displayed graph
     */
    public relations = [] as Array<ApiRelation>;

    /**
     * True, while the neighbors of the currently selected node are loading
     */
    public loading = false;

    /**
     * Flag to handle the splitting of overlapping relations differently for the neighbor preview
     */
    public inventoryActive = false;
}

export const inventory = {
    namespaced: true,
    state: new InventoryState(),
    mutations: {
        /**
         * Set selected item
         */
        setSelectedNode(state: InventoryState, node: ApiNode): void {
            state.selectedNode = node;
        },

        /**
         * Set dragged item
         */
        setDraggedNode(state: InventoryState, node?: ApiNode): void {
            state.draggedNode = node;
        },

        /**
         * Set neighbors of the selected node
         */
        setNeighbors(state: InventoryState, nodes: Array<ApiNode>): void {
            state.neighbors = nodes;
        },

        /**
         * Set direct relations from the selected node
         */
        setRelations(state: InventoryState, relations: Array<ApiRelation>): void {
            state.relations = relations;
        },

        /**
         * Sets the loading flag
         */
        setLoading(state: InventoryState, loading: boolean): void {
            state.loading = loading;
        },

        /**
         * Sets the active state of the inventory
         */
        setActive(state: InventoryState, active: boolean): void {
            state.inventoryActive = active;
        },

        /**
         * Reset state for neighbor relations
         */
        reset(state: InventoryState): void {
            state.relations.length = 0;
            state.neighbors.length = 0;
        },
    },
    actions: {
        /**
         * Loads the relations of a given node
         */
        async loadRelations(context: ActionContext<InventoryState, RootState>, node: ApiNode): Promise<void> {
            context.commit("setLoading", true);

            // Get relations of the node
            const res = await GET(`/api/nodes/${node.nodeId}/relations`);
            if (res.status !== 200) {
                context.commit("setLoading", false);
                return;
            }

            const apiRelationsOrigin: Array<ApiRelation> = await res.json();

            await context.dispatch("loadNeighborNodes", {
                apiRelationsOrigin: apiRelationsOrigin,
                origin: node,
            });

            context.commit("setLoading", false);
        },

        /**
         * Loads the neighbor nodes of a node given its relations
         */
        async loadNeighborNodes(
            context: ActionContext<InventoryState, RootState>,
            payload: { apiRelationsOrigin: Array<ApiRelation>; origin: ApiNode },
        ): Promise<void> {
            // Get neighbors and transform them to nodes
            const neighborIds: Array<string> = [];
            payload.apiRelationsOrigin.forEach((relation: ApiRelation) => {
                const neighborId = relation.from === payload.origin.nodeId ? relation.to : relation.from;
                if (!neighborIds.includes(neighborId)) neighborIds.push(neighborId);
            });
            const apiNodes: Array<ApiNode> = await Promise.all(
                [...neighborIds].map(async (id) => (await (await GET(`api/nodes/${id}`)).json()) as ApiNode),
            );

            await context.dispatch("loadNeighborRelations", {
                neighborIds: neighborIds,
                apiRelationsOrigin: payload.apiRelationsOrigin,
            });

            context.commit("setNeighbors", apiNodes);
        },

        /**
         * Loads the relations of all given nodes into the state
         */
        async loadNeighborRelations(
            context: ActionContext<InventoryState, RootState>,
            payload: { neighborIds: Array<string>; apiRelationsOrigin: Array<ApiRelation> },
        ): Promise<void> {
            // Get relations of the neighbors
            const apiRelationsNeighbors = await Promise.all(
                [...payload.neighborIds].map(
                    async (id) => (await (await GET(`api/nodes/${id}/relations`)).json()) as Array<ApiRelation>,
                ),
            );

            const relationsToAdd = new Map<string, ApiRelation>();
            apiRelationsNeighbors.flat().forEach((relation: ApiRelation) => {
                relationsToAdd.set(relation.relationId, relation);
            });

            context.commit("setRelations", [...payload.apiRelationsOrigin, ...relationsToAdd.values()]);
        },

        /**
         * Gets a node by the provided id
         */
        async getNode(context: ActionContext<InventoryState, RootState>, nodeId: number): Promise<ApiNode | undefined> {
            const res = await GET("/api/nodes/" + nodeId);
            if (res.status !== 200) return undefined;
            return await res.json();
        },

        /**
         * Gets the relation types that are possible for a specific label
         */
        async getPossibleRelationTypes(
            context: ActionContext<InventoryState, RootState>,
            label: string,
        ): Promise<Array<string> | undefined> {
            const res = await GET("/api/data-scheme/relation");
            if (res.status !== 200) return undefined;

            const data: Array<RootObject> = await res.json();

            return data
                .filter((relation) => relation.connections.some((connection) => connection.from === label))
                .map((entry) => entry.name);
        },
    },
};
