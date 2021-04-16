import ApiNode from "@/modules/editor/models/ApiNode";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { GET } from "@/utility";
import ApiRelation from "@/modules/editor/models/ApiRelation";

export class InventoryState {
    /**
     * Replication of the overview item that is selected or dragged into the diagram
     */
    public selectedNode?: ApiNode;

    /**
     * First degree neighbors of the currently selected node
     */
    public neighbors = [] as Array<ApiNode>;

    /**
     * Relations for the currently displayed graph
     */
    public relations = [] as Array<ApiRelation>;

    /**
     * Maps the uuid of a node to the id of a diagram shape
     */
    public mappedNodes = new Map<string, string | number>();

    /**
     * Maps the uuid of a relation to the id of a diagram link
     */
    public mappedRelations = new Map<string, string | number>();

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
         * Maps the uuid of a node to the shape in the diagram
         */
        addNodeToDiagram(state: InventoryState, payload: { uuid: string; shapeId: string | number }): void {
            state.mappedNodes.set(payload.uuid, payload.shapeId);
        },

        /**
         * Maps the uuid of a relation to the link in the diagram
         */
        addRelationToDiagram(state: InventoryState, payload: { uuid: string; linkId: string | number }): void {
            state.mappedRelations.set(payload.uuid, payload.linkId);
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
            state.mappedNodes.clear();
            state.mappedRelations.clear();
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
    },
};
