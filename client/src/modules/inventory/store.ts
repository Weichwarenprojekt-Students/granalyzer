import ApiNode from "@/models/data-scheme/ApiNode";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { errorToast, GET, POST, successToast, isUnexpected } from "@/utility";
import ApiRelation from "@/models/data-scheme/ApiRelation";
import i18n from "@/i18n";
import { GraphUtils } from "@/modules/inventory/modules/neighbor-view/controls/GraphUtils";
import { ApiRelationType } from "@/models/data-scheme/ApiRelationType";

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
     * All relations of the nodes in the currently displayed graph
     */
    public relations = [] as Array<ApiRelation>;

    /**
     * True, while the neighbors of the currently selected node are loading
     */
    public loading = false;

    /**
     * Utility functions for the neighbor view
     */
    public graphUtils = {} as GraphUtils;
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
         * Set the neighbor utils
         */
        setGraphUtils(state: InventoryState, graphUtils: GraphUtils): void {
            state.graphUtils = graphUtils;
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
         * Load the neighbor data for a given node
         */
        async loadNeighbors(context: ActionContext<InventoryState, RootState>, node: ApiNode): Promise<void> {
            context.commit("setLoading", true);

            // Ensure that a node is loaded and that it is up to date
            node = node ?? context.state.selectedNode;
            const nodeRes = await GET(`api/nodes/${node ? node.nodeId : ""}`);
            node = nodeRes.status === 200 ? await nodeRes.json() : undefined;
            context.commit("setSelectedNode", node);
            if (!node) {
                context.commit("setLoading", false);
                return;
            }

            // Get relations of the node
            const res = await GET(`/api/nodes/${node.nodeId}/relations`);
            if (isUnexpected(res)) {
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
            if (isUnexpected(res)) return undefined;
            return await res.json();
        },

        /**
         * Gets the relation types that are possible for a specific label
         */
        async getPossibleRelationTypes(
            context: ActionContext<InventoryState, RootState>,
            payload: { fromLabel: string; toLabel: string },
        ): Promise<Array<string> | undefined> {
            const res = await GET("/api/data-scheme/relation");
            if (res.status !== 200) return undefined;

            const data: Array<ApiRelationType> = await res.json();

            return data
                .filter((relation) =>
                    relation.connections.some(
                        (connection) => connection.from === payload.fromLabel && connection.to === payload.toLabel,
                    ),
                )
                .map((entry) => entry.name);
        },

        /**
         * Adds a new relation between two nodes, given their ids
         */
        async addNewRelation(context: ActionContext<InventoryState, RootState>, relation: ApiRelation): Promise<void> {
            const response = await POST("/api/relations", JSON.stringify(relation));

            if (response.status !== 201)
                errorToast(
                    i18n.global.t("inventory.newRelation.error.title"),
                    i18n.global.t("inventory.newRelation.error.description"),
                );
            else {
                await context.dispatch("loadNeighbors");
                successToast(
                    i18n.global.t("inventory.newRelation.success.title"),
                    i18n.global.t("inventory.newRelation.success.description"),
                );
            }
        },
    },
};
