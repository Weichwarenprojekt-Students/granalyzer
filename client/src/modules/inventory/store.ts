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
    public directRelations = [] as Array<ApiRelation>;

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
        addNeighbors(state: InventoryState, nodes: Array<ApiNode>): void {
            state.neighbors.push(...nodes);
        },

        /**
         * Set direct relations from the selected node
         */
        addRelations(state: InventoryState, relations: Array<ApiRelation>): void {
            state.directRelations.push(...relations);
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
         * Reset state for neighbor relations
         */
        reset(state: InventoryState): void {
            state.directRelations = [];
            state.neighbors = [];
            state.mappedNodes.clear();
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
            const apiRelationsOrigin: Array<ApiRelation> = await res.json();

            context.commit("addRelations", apiRelationsOrigin);
            await context.dispatch("loadNeighborNodes", apiRelationsOrigin);
            context.commit("setLoading", false);
        },

        /**
         * Loads the neighbor nodes of a node given its relations
         */
        async loadNeighborNodes(
            context: ActionContext<InventoryState, RootState>,
            apiRelationsOrigin: ApiRelation[],
        ): Promise<void> {
            // Get neighbors and transform them to nodes
            const neighborIds: Array<string> = [];
            apiRelationsOrigin.forEach((apiRelationsOrigin: ApiRelation) => {
                if (!neighborIds.includes(apiRelationsOrigin.to)) neighborIds.push(apiRelationsOrigin.to);
            });
            const apiNodes: Array<ApiNode> = await Promise.all(
                [...neighborIds].map(async (id) => (await (await GET(`api/nodes/${id}`)).json()) as ApiNode),
            );

            context.commit("addNeighbors", apiNodes);
            await context.dispatch("loadNeighborRelations", neighborIds);
        },

        /**
         * Loads the relations of all given nodes into the state
         */
        async loadNeighborRelations(
            context: ActionContext<InventoryState, RootState>,
            neighborIds: Array<string>,
        ): Promise<void> {
            // Get relations of the neighbors
            const apiRelationsNeighbors = await Promise.all(
                [...neighborIds].map(
                    async (id) => (await (await GET(`api/nodes/${id}/relations`)).json()) as Array<ApiRelation>,
                ),
            );

            const relationsToAdd = new Map<string, ApiRelation>();
            apiRelationsNeighbors.flat().forEach((relation: ApiRelation) => {
                relationsToAdd.set(relation.relationId, relation);
            });

            context.commit("addRelations", Array.from(relationsToAdd.values()));
        },
    },
};
