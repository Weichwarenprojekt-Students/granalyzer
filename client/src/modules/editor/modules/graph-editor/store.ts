import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { NodeInfo } from "./controls/nodes/models/NodeInfo";
import { ApiDiagram } from "@/models/ApiDiagram";
import { CreateNodeCommand } from "./controls/nodes/commands/CreateNodeCommand";
import { g } from "jointjs";
import { RemoveNodeCommand } from "@/modules/editor/modules/graph-editor/controls/nodes/commands/RemoveNodeCommand";
import { GET, PUT, randomRange } from "@/utility";
import { RelationInfo } from "./controls/relations/models/RelationInfo";
import ApiRelation from "@/models/data-scheme/ApiRelation";
import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";
import { NewRelationCommand } from "@/modules/editor/modules/graph-editor/controls/relations/commands/NewRelationCommand";
import { RemoveRelationCommand } from "@/modules/editor/modules/graph-editor/controls/relations/commands/RemoveRelationCommand";
import { ZIndexCommand } from "@/modules/editor/modules/graph-editor/controls/commands/ZIndexCommand";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/relations/Relation";
import { Node } from "@/modules/editor/modules/graph-editor/controls/nodes/Node";
import { ShapeNodeCommand } from "@/modules/editor/modules/graph-editor/controls/nodes/commands/ShapeNodeCommand";
import ApiNode from "@/models/data-scheme/ApiNode";
import { CompoundCommand } from "@/modules/editor/modules/graph-editor/controls/commands/CompoundCommand";
import { NodeShapes } from "@/shared/NodeShapes";
import { RestyleCommand } from "@/modules/editor/modules/graph-editor/controls/commands/RestyleCommand";
import { HeatConfig } from "@/modules/editor/modules/heat-map/models/HeatConfig";

export class GraphEditorState {
    /**
     * The graph handler
     */
    public graphHandler?: GraphHandler;

    /**
     * The diagram element which has been clicked most recently
     */
    public selectedElement?: Node | Relation;

    /**
     * True if the graph editor is currently loading
     */
    public editorLoading = false;

    /**
     * True if the relation edit mode is active
     */
    public relationModeActive = false;

    /**
     * True if the dialog for creating a new relation should be displayed
     */
    public newRelationDialog = false;

    /**
     * Temporarily save a new relation command while the new relation dialog is open
     */
    public newRelationCommand?: NewRelationCommand;

    /**
     * Amount of related nodes of the selected node
     */
    public relatedNodesAmount = 0;
}

/**
 * Get create node command for one node
 *
 * @param graphHandler Instance of the graph handler
 * @param nodeInfo The node info of the node to create
 */
async function getCreateNodeCommand(graphHandler: GraphHandler, nodeInfo: NodeInfo) {
    // Perform api request
    const res = await GET("/api/nodes/" + nodeInfo.ref.uuid + "/relations");
    const newVar: ApiRelation[] = res.status === 200 ? await res.json() : [];

    // Transform relations from api into Relation objects
    const relations: RelationInfo[] = newVar.map((rel) => {
        return {
            from: { uuid: rel.from, index: 0 },
            to: { uuid: rel.to, index: 0 },
            uuid: rel.relationId,
            name: rel.type,
            color: Relation.NORMAL_RELATION_COLOR,
        } as RelationInfo;
    });

    return new CreateNodeCommand(graphHandler, nodeInfo, relations);
}

/**
 * Get the uuids of all unique neighbors, which are not connected to the central node
 *
 * @param node The central node
 */
async function getUniqueNeighborIds(node: Node): Promise<Set<string> | undefined> {
    // Get all relations directly connected to the node
    const res = await GET("/api/nodes/" + node.reference.uuid + "/relations");

    // Unique ids of new nodes
    const nodeIds = new Set<string>();

    for (const rel of (res.status === 200 ? await res.json() : []) as Array<ApiRelation>) {
        // Remove circle relations
        if (rel.from === rel.to) continue;
        // Add relation if other node not yet connected to this node
        if (![...node.outgoingRelations.values()].filter((r) => r.info.to.uuid === rel.to).length)
            if (rel.to !== node.reference.uuid) nodeIds.add(rel.to);
        if (![...node.incomingRelations.values()].filter((r) => r.info.from.uuid === rel.from).length)
            if (rel.from !== node.reference.uuid) nodeIds.add(rel.from);
    }

    return nodeIds;
}

export const graphEditor = {
    state: new GraphEditorState(),
    mutations: {
        /**
         * Set the active diagram handler
         */
        setGraphHandler(state: GraphEditorState, graphHandler: GraphHandler): void {
            state.graphHandler = graphHandler;
        },
        /**
         * Set the active diagram
         */
        generateDiagramFromJSON(state: GraphEditorState, diagram: ApiDiagram): void {
            state.graphHandler?.fromJSON(diagram.serialized);
        },

        /**
         * Set the clicked diagram element
         */
        setSelectedElement(state: GraphEditorState, selectedElement?: Node | Relation): void {
            state.selectedElement = selectedElement;
        },

        /**
         * Centers the content of the graph
         */
        centerContent(state: GraphEditorState): void {
            state.graphHandler?.controls.centerContent();
        },

        /**
         * Change the active diagram
         */
        undo(state: GraphEditorState): void {
            state.graphHandler?.Undo();
        },
        /**
         * Set selected item
         */
        redo(state: GraphEditorState): void {
            state.graphHandler?.Redo();
        },
        /**
         * Remove a node or relation
         */
        removeNode(state: GraphEditorState): void {
            if (!state.graphHandler) return;
            if (state.selectedElement?.isNode())
                state.graphHandler.addCommand(new RemoveNodeCommand(state.graphHandler, state.selectedElement));
            else if (state.selectedElement?.isRelation())
                state.graphHandler.addCommand(new RemoveRelationCommand(state.graphHandler, state.selectedElement));

            state.graphHandler.controls.resetSelection();
        },
        /**
         * Restyle a node or relation
         */
        restyleElement(state: GraphEditorState, restyleCommand: RestyleCommand): void {
            if (!state.graphHandler) return;
            state.graphHandler.addCommand(restyleCommand);
        },
        /**
         * Remove a node or relation
         */
        changeNodeShape(state: GraphEditorState, [shape, node]: [string, Node]): void {
            if (!state.graphHandler) return;
            state.graphHandler.addCommand(new ShapeNodeCommand(state.graphHandler, node, shape));
        },
        /**
         * Active/Deactivate the loading state
         */
        setEditorLoading(state: GraphEditorState, loading: boolean): void {
            state.editorLoading = loading;
        },
        /**
         * Activate/Deactivate the relation edit mode
         */
        setRelationMode(state: GraphEditorState, value: boolean): void {
            if (!state.graphHandler) {
                state.relationModeActive = false;
                return;
            }

            // Deselect elements
            state.graphHandler.controls.resetSelection();

            // Disable interactivity of nodes in relation mode
            // state.graphHandler.graph.setInteractivity(!value);
            state.relationModeActive = value;
        },
        /**
         * Add new command for undo/redo
         */
        addCommand(state: GraphEditorState, command: ICommand): void {
            state.graphHandler?.addCommand(command);
        },
        /**
         * Set the flag for showing the new relation dialog
         */
        showNewRelationDialog(state: GraphEditorState, value: boolean): void {
            state.newRelationDialog = value;
        },
        /**
         * Set the temporary new relation command
         */
        setNewRelationCommand(state: GraphEditorState, command: NewRelationCommand | undefined): void {
            state.newRelationCommand = command;
        },

        /**
         * Updates the amount of nodes related to the selected nodes
         */
        updateRelatedNodesCount(state: GraphEditorState, relatedNodesAmount: number): void {
            // Write amount of loaded related nodes to member
            state.relatedNodesAmount = relatedNodesAmount;
        },
        /**
         * Reset the selection in the graph editor
         */
        resetSelection(state: GraphEditorState): void {
            state.graphHandler?.controls.resetSelection();
        },
        /**
         * Set an active heat config
         */
        setHeatConfig(state: GraphEditorState, { label, config }: { label: string; config: HeatConfig }): void {
            state.graphHandler?.heatConfigs.set(label, config);
        },
        /**
         * Delete active heat config for labels
         */
        deleteHeatConfig(state: GraphEditorState, label: string): void {
            state.graphHandler?.heatConfigs.delete(label);
        },
    },
    actions: {
        /**
         * Undo a change
         */
        async undo(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            context.commit("setEditorLoading", true);
            await context.dispatch("setRelationMode", false);
            context.commit("undo");
            context.commit("setEditorLoading", false);

            await context.dispatch("saveChange");

            await context.dispatch("editor/updateHeatMap", undefined, { root: true });
        },
        /**
         * Redo a change
         */
        async redo(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            context.commit("setEditorLoading", true);
            await context.dispatch("setRelationMode", false);
            context.commit("redo");
            context.commit("setEditorLoading", false);

            await context.dispatch("saveChange");

            await context.dispatch("editor/updateHeatMap", undefined, { root: true });
        },
        /**
         * Add a node with its relations
         */
        async addNode(context: ActionContext<GraphEditorState, RootState>, node: NodeInfo): Promise<void> {
            if (!context.state.graphHandler) return;

            context.commit("setEditorLoading", true);

            const createNodeCommand: CreateNodeCommand = await getCreateNodeCommand(context.state.graphHandler, node);

            context.commit("setEditorLoading", false);

            await context.dispatch("addCommand", createNodeCommand);

            await context.dispatch("editor/updateHeatMap", undefined, { root: true });
        },
        /**
         * Remove a node
         */
        async removeNode(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            context.commit("setEditorLoading", true);
            context.commit("removeNode");
            context.commit("setEditorLoading", false);
            await context.dispatch("saveChange");

            await context.dispatch("editor/updateHeatMap", undefined, { root: true });
        },
        /**
         * Restyle a relation or node
         */
        async restyleElement(
            context: ActionContext<GraphEditorState, RootState>,
            restyleCommand: RestyleCommand,
        ): Promise<void> {
            context.commit("setEditorLoading", true);
            context.commit("restyleElement", restyleCommand);
            context.commit("setEditorLoading", false);
            await context.dispatch("saveChange");

            await context.dispatch("editor/updateHeatMap", undefined, { root: true });
        },
        /**
         * Change the shape of a node
         */
        async changeNodeShape(context: ActionContext<GraphEditorState, RootState>, shape: string): Promise<void> {
            const node = context.state.selectedElement;
            if (!node?.isNode()) return;

            context.commit("setEditorLoading", true);

            context.commit("resetSelection");
            context.commit("changeNodeShape", [shape, node]);

            context.commit("setEditorLoading", false);

            await context.dispatch("saveChange");

            // Select new shape
            await context.state.graphHandler?.controls.selectNode(
                context.state.graphHandler?.graph.paper.findViewByModel(node.joint),
            );
        },

        /**
         * Save changes to backend
         */
        async saveChange(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            const graph = context.state.graphHandler?.toJSON();

            if (graph) {
                const diagram = context.rootState.editor?.diagram;
                if (!diagram) return;
                diagram.serialized = graph;

                await PUT("/api/diagrams/" + diagram.diagramId, JSON.stringify(diagram));
            }
        },

        /**
         * Set the relation edit mode to a certain value
         */
        async setRelationMode(context: ActionContext<GraphEditorState, RootState>, value: boolean): Promise<void> {
            const oldValue = context.state.relationModeActive;
            context.commit("setSelectedElement", undefined);

            // Reset inspector selection
            context.commit("inspector/resetSelection", undefined, { root: true });
            context.commit("setRelationMode", value);

            // Activate/Deactivate relation edit mode
            if (value === oldValue) return;
            context.commit("setEditorLoading", true);
            if (context.state.relationModeActive) await context.state.graphHandler?.relationMode.enable();
            else await context.state.graphHandler?.relationMode.disable();
            context.commit("setEditorLoading", false);
        },

        /**
         * Toggle the relation edit mode
         */
        async toggleRelationMode(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            await context.dispatch("setRelationMode", !context.state.relationModeActive);
        },

        /**
         * Add any command to the undo/redo stack
         */
        async addCommand(context: ActionContext<GraphEditorState, RootState>, command: ICommand): Promise<void> {
            context.commit("addCommand", command);
            await context.dispatch("saveChange");
        },
        /**
         * Add command to change the z index of an element
         */
        async addZIndexCommand(
            context: ActionContext<GraphEditorState, RootState>,
            bringToFront: boolean,
        ): Promise<void> {
            if (!context.state.graphHandler || !context.state.selectedElement) return;

            const zIndexCommand = new ZIndexCommand(
                context.state.graphHandler,
                context.state.selectedElement.joint,
                bringToFront,
            );

            if (zIndexCommand.zIndexChanges) await context.dispatch("addCommand", zIndexCommand);
        },
        /**
         * Open the new relation dialog and temporarily save the command for adding the new relation
         */
        async openNewRelationDialog(
            context: ActionContext<GraphEditorState, RootState>,
            command: NewRelationCommand,
        ): Promise<void> {
            context.commit("setNewRelationCommand", command);
            context.commit("showNewRelationDialog", true);
        },
        /**
         * Close the new relation dialog and remove the new relation command
         */
        async closeNewRelationDialog(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            context.commit("setNewRelationCommand", undefined);
            context.commit("showNewRelationDialog", false);
        },
        /**
         * Confirm the new relation dialog
         */
        async confirmNewRelationDialog(
            context: ActionContext<GraphEditorState, RootState>,
            labelText: string,
        ): Promise<void> {
            if (context.state.newRelationCommand) {
                // Set the label text for the new relation
                context.state.newRelationCommand.setLabelText(labelText);
                // Add the command to the undo/redo stack
                await context.dispatch("addCommand", context.state.newRelationCommand);
            }

            await context.dispatch("closeNewRelationDialog");
        },
        /**
         * Add related nodes
         */
        async addRelatedNodes(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            if (!context.state.graphHandler || !context.state.selectedElement) return;

            // Check if selected element is Node
            if (!context.state.selectedElement?.isNode()) return;

            context.commit("setEditorLoading", true);

            const nodeIds = await getUniqueNeighborIds(context.state.selectedElement);

            if (nodeIds != null) {
                // Get array of create node commands
                const commands: CreateNodeCommand[] = await context.dispatch("getNodeCommands", [
                    nodeIds,
                    context.state.selectedElement.position,
                ]);

                // Dispatch all commands at once
                if (commands.length) await context.dispatch("addCommand", new CompoundCommand(commands));
            }

            context.commit("setEditorLoading", false);
        },
        /**
         * Get create commands for multiple nodes
         */
        async getNodeCommands(
            context: ActionContext<GraphEditorState, RootState>,
            [nodeIds, originPosition]: [Set<string>, g.PlainPoint],
        ): Promise<CreateNodeCommand[]> {
            return (
                await Promise.all(
                    [...nodeIds].map(async (id) => {
                        // Perform request
                        const res = await GET(`/api/nodes/${id}`);

                        if (!context.state.graphHandler || res.status !== 200) return;

                        const apiNode: ApiNode = await res.json();

                        // Transform to node info
                        const nodeInfo: NodeInfo = {
                            x: originPosition.x + randomRange(150, 500),
                            y: originPosition.y + randomRange(150, 500),
                            ref: {
                                uuid: apiNode.nodeId,
                                index: 0,
                            },
                            label: apiNode.label,
                            name: apiNode.name,
                            shape: NodeShapes.RECTANGLE,
                            labelColor: context.rootState.overview?.labelColor.get(apiNode.label)?.color,
                            size: { width: -1, height: -1 },
                        };

                        return await getCreateNodeCommand(context.state.graphHandler, nodeInfo);
                    }),
                )
            ).filter((el): el is CreateNodeCommand => !!el);
        },
        /**
         * Updates the amount of nodes related to the selected nodes
         */
        async updateRelatedNodesCount(context: ActionContext<GraphEditorState, RootState>, node?: Node): Promise<void> {
            if (!context.state.graphHandler) return;
            if (!node || !node.reference.uuid) {
                context.commit("updateRelatedNodesCount", 0);
                return;
            }

            // Get ids of related nodes
            const relatedNodeIds = await getUniqueNeighborIds(node);

            // Pass amount of nodes to mutation
            context.commit("updateRelatedNodesCount", relatedNodeIds?.size ?? 0);
        },
    },
    getters: {
        /**
         * @return True if undo is available
         */
        undoAvailable(state: GraphEditorState): boolean {
            return !!state.graphHandler?.hasUndo();
        },
        /**
         * @return True if redo is available
         */
        redoAvailable(state: GraphEditorState): boolean {
            return !!state.graphHandler?.hasRedo();
        },
        /**
         * @return True if element is being in selection
         */
        itemSelected(state: GraphEditorState): boolean {
            return state.selectedElement !== undefined;
        },
        /**
         * @return Set of labels in the diagram
         */
        labels(state: GraphEditorState): Set<string> {
            const labels = new Set<string>();
            if (!state.graphHandler) return labels;
            if (state.graphHandler) for (const node of state.graphHandler?.nodes) labels.add(node.info.label);
            return labels;
        },
    },
};
