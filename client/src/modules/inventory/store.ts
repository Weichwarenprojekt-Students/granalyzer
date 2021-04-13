import ApiNode from "@/modules/editor/models/ApiNode";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { GET } from "@/utility";
import ApiRelation from "@/modules/editor/models/ApiRelation";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/models/Relation";
import { Node } from "@/modules/editor/modules/graph-editor/controls/models/Node";

// TODO :: Outsource neighbor-view related data into a NeighborState
export class InventoryState {
    /**
     * Replication of the overview item that is selected or dragged into the diagram
     */
    public selectedNode?: ApiNode;

    /**
     * Neighbors of the currently selected node
     */
    public neighbors?: Node[];

    /**
     * Direct relations to neighbors
     */
    public directRelations?: Relation[];

    /**
     * Maps the uuid of a node to the id of a diagram shape
     */
    public mappedNodes = new Map<string, string | number>();

    /**
     * True, while the neighbors of the currently selected node are loading
     */
    public loadingNeighbors = false;
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
        setNeighbors(state: InventoryState, nodes: Node[]): void {
            state.neighbors = nodes;
        },
        /**
         * Sets the loading flag
         */
        setLoading(state: InventoryState, loading: boolean): void {
            state.loadingNeighbors = loading;
        },
        /**
         * Set direct relations from the selected node
         */
        setDirectRelations(state: InventoryState, relations: Relation[]): void {
            state.directRelations = relations;
        },
        addNodeToDiagram(state: InventoryState, payload: { uuid: string; shapeId: string | number }): void {
            state.mappedNodes.set(payload.uuid, payload.shapeId);
        },
        /**
         * Reset state for neighbor relations
         */
        reset(state: InventoryState): void {
            state.directRelations = [];
            state.neighbors = [];
            state.mappedNodes = new Map<string, string | number>();
        },
    },
    actions: {
        /**
         * Loads the neighbors of the given node into the state
         */
        async loadRelationsAndNeighbors(
            context: ActionContext<InventoryState, RootState>,
            node: ApiNode,
        ): Promise<void> {
            // TODO :: Outsource :: Split this into LoadNeighbors, LoadRelations, LoadNeighborRelations
            context.commit("setLoading", true);

            // Get relations of the node
            const res = await GET(`/api/nodes/${node.nodeId}/relations`);
            const apiRelationsOrigin = await res.json();

            // Transform ApiRelation to Relations
            const diaRelations: Relation[] = apiRelationsOrigin.map((rel: ApiRelation) => {
                return {
                    from: { uuid: rel.from, index: 0 },
                    to: { uuid: rel.to, index: 0 },
                    uuid: rel.relationId,
                    type: rel.type,
                };
            });

            // Get neighbors and transform them to nodes
            const neighborIds: string[] = [];
            apiRelationsOrigin.forEach((apiRelationsOrigin: ApiRelation) => {
                if (!neighborIds.includes(apiRelationsOrigin.to)) neighborIds.push(apiRelationsOrigin.to);
            });
            const apiNodes = await Promise.all(
                [...neighborIds].map(async (id) => (await (await GET(`api/nodes/${id}`)).json()) as ApiNode),
            );

            // Transform ApiNodes to Nodes
            const diaNeighbors = apiNodes.map((apiNode) => {
                return {
                    x: 0,
                    y: 0,
                    label: apiNode.label,
                    name: apiNode.name,
                    shape: "rectangle",
                    ref: { uuid: apiNode.nodeId, index: 0 },
                    color: context.rootState.labelColor.get(apiNode.label)?.color ?? "#70FF87",
                };
            });

            // Get relations between the neighbor nodes
            const apiRelationsNeighbors = await Promise.all(
                [...neighborIds].map(
                    async (id) => (await (await GET(`api/nodes/${id}/relations`)).json()) as Array<ApiRelation>,
                ),
            );

            // TODO :: Refactor (just take all relations and check if source and target is defined)
            // Filter neighbor relations, only include those, that connect the neighbors themselves
            const relationsToAdd = new Map<string, Relation>();
            apiRelationsNeighbors.forEach((relations: Array<ApiRelation>, index) => {
                const currentNeighborId = neighborIds[index];
                relations.forEach((relation) => {
                    // Only take relations that dont connect with the origin
                    if (node.nodeId !== relation.to && node.nodeId !== relation.from) {
                        // Only take relations, that connect neighbor nodes
                        if (
                            (relation.to !== currentNeighborId && neighborIds.includes(relation.to)) ||
                            (relation.from !== currentNeighborId && neighborIds.includes(relation.from))
                        ) {
                            relationsToAdd.set(relation.relationId, {
                                from: { uuid: relation.from, index: 0 },
                                to: { uuid: relation.to, index: 0 },
                                uuid: relation.relationId,
                                type: relation.type,
                            });
                        }
                    }
                });
            });
            diaRelations.push(...Array.from(relationsToAdd.values()));

            context.commit("setDirectRelations", diaRelations);
            context.commit("setNeighbors", diaNeighbors);
            context.commit("setLoading", false);
        },
    },
};
