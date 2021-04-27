import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { NodeInfo } from "./controls/nodes/models/NodeInfo";
import { ApiDiagram } from "@/models/ApiDiagram";
import { CreateNodeCommand } from "./controls/nodes/commands/CreateNodeCommand";
import { dia } from "jointjs";
import { RemoveNodeCommand } from "@/modules/editor/modules/graph-editor/controls/nodes/commands/RemoveNodeCommand";
import { GET, PUT } from "@/utility";
import { RelationInfo } from "./controls/relations/models/RelationInfo";
import ApiRelation from "@/models/data-scheme/ApiRelation";
import { ICommand } from "@/modules/editor/modules/graph-editor/controls/models/ICommand";
import { NewRelationCommand } from "@/modules/editor/modules/graph-editor/controls/relations/commands/NewRelationCommand";
import ApiNode from "@/models/data-scheme/ApiNode";
import { RelatedNodesUtils } from "./controls/RelatedNodesUtils";
import { CreateNodesCommand } from "@/modules/editor/modules/graph-editor/controls/nodes/commands/CreateNodesCommand";

export class GraphEditorState {
    /**
     * The graph handler
     */
    public graphHandler?: GraphHandler;

    /**
     * The diagram element which has been clicked most recently
     */
    public selectedElement?: dia.Element;

    /**
     * True if the graph editor is currently loading
     */
    public editorLoading = false;

    /**
     * True if the relation edit mode is active
     */
    public relationModeActive = false;

    public newRelationDialog = false;

    public newRelationCommand?: NewRelationCommand;

    /**
     * Amount of related nodes of the selected node
     */
    public relatedNodesAmount = 0;
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
            if (state.graphHandler) state.graphHandler.fromJSON(diagram.serialized);
        },

        /**
         * Set the clicked diagram element
         */
        setSelectedElement(state: GraphEditorState, diagElement?: dia.Element): void {
            state.selectedElement = diagElement;
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
         * Add a node
         */
        addNode(
            state: GraphEditorState,
            { node, relations, labelColor }: { node: NodeInfo; relations: RelationInfo[]; labelColor?: string },
        ): void {
            state.graphHandler?.addCommand(new CreateNodeCommand(state.graphHandler, node, relations, labelColor));
        },
        /**
         * Adds multiple nodes
         */
        addNodes(
            state: GraphEditorState,
            { nodes, relations, labelColors }: { nodes: NodeInfo[]; relations: RelationInfo[][]; labelColors: string[] },
        ): void {
            state.graphHandler?.addCommand(new CreateNodesCommand(state.graphHandler, nodes, relations, labelColors));
        },
        /**
         * Remove a node
         */
        removeNode(state: GraphEditorState): void {
            if (state.graphHandler && state.selectedElement) {
                const node = state.graphHandler.nodes.getByJointId(state.selectedElement.id);

                if (node != null) state.graphHandler.addCommand(new RemoveNodeCommand(state.graphHandler, node));
            }
            state.selectedElement = undefined;
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
            state.graphHandler.graph.deselectElements();

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
        },
        /**
         * Add a node with its relations
         */
        async addNode(context: ActionContext<GraphEditorState, RootState>, node: NodeInfo): Promise<void> {
            context.commit("setEditorLoading", true);

            // Perform api request
            const res = await GET("/api/nodes/" + node.ref.uuid + "/relations");
            const newVar: ApiRelation[] = await res.json();

            // Transform relations from api into Relation objects
            const relations: RelationInfo[] = newVar.map((rel) => {
                return {
                    from: { uuid: rel.from, index: 0 },
                    to: { uuid: rel.to, index: 0 },
                    uuid: rel.relationId,
                    label: rel.type,
                } as RelationInfo;
            });

            const labelColor = context.rootState.overview?.labelColor.get(node.label)?.color;

            context.commit("addNode", { node, relations, labelColor });
            context.commit("setEditorLoading", false);

            await context.dispatch("saveChange");
        },

        /**
         * Add related nodes
         */
        async addRelatedNodes(context: ActionContext<GraphEditorState, RootState>): Promise<void> { //TODO: refactor this method...too long
            context.commit("setEditorLoading", true);

            const relatedNodeUtils = new RelatedNodesUtils();

            const graphHandler = context.state.graphHandler;
            if (!graphHandler) return;

            if (!context.state.selectedElement) return;

            const nodeUuid = graphHandler.nodes.getByJointId(context.state.selectedElement.id)?.reference.uuid;
            if (nodeUuid == null) return;
            const res = await GET("/api/nodes/" + nodeUuid + "/related");
            const apiNodes: ApiNode[] = await res.json();

            // Array for nodes to be added to diagram
            const nodes: NodeInfo[] = [];

            for (const apiNode of apiNodes) {
                const node: NodeInfo = {
                    x: context.state.selectedElement.position().x + relatedNodeUtils.randomRange(150, 500),
                    y: context.state.selectedElement.position().y + relatedNodeUtils.randomRange(150, 500),
                    ref: {
                        uuid: apiNode.nodeId,
                        index: 0,
                    },
                    label: apiNode.label,
                    name: apiNode.name,
                    shape: "rectangle",
                    color: "#eeeeee",
                };

                // Filter nodes that are already in the diagram
                let alreadyInDiagram = false;

                if (graphHandler.nodes.getByUuid(apiNode.nodeId).size !== 0) {
                    alreadyInDiagram = true;
                }

                //if (!alreadyInDiagram) await context.dispatch("addNode", node);
                if (!alreadyInDiagram) nodes.push(node);
            }

            // Load relations for nodes
            const relations: RelationInfo[][] = [];

            for (let i = 0; i < nodes.length; i++) {
                // Perform api request
                const res = await GET("/api/nodes/" + nodes[i].ref.uuid + "/relations");
                const newVar: ApiRelation[] = await res.json();

                // Transform relations from api into Relation objects
                const nodeRelations: RelationInfo[] = newVar.map((rel) => {
                    return {
                        from: { uuid: rel.from, index: 0 },
                        to: { uuid: rel.to, index: 0 },
                        uuid: rel.relationId,
                        label: rel.type,
                    } as RelationInfo;
                });

                relations[i] = [];

                for (const nodeRelation of nodeRelations) {
                    relations[i].push(nodeRelation);
                }
            }

            // Get the label colors
            const labelColors = [];
            for (const node of nodes) {
                labelColors.push(context.rootState.overview?.labelColor.get(node.label)?.color);
            }

            context.commit("addNodes", { nodes, relations, labelColors });
            context.commit("setEditorLoading", false);

            await context.dispatch("saveChange");

        },

        /**
         * Remove a node
         */
        async removeNode(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            context.commit("setEditorLoading", true);
            context.commit("removeNode");
            context.commit("setEditorLoading", false);

            await context.dispatch("saveChange");
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
            context.commit("setSelectedElement", undefined);

            // Reset inspector selection
            context.commit("inspector/resetSelection", undefined, { root: true });

            context.commit("setRelationMode", value);
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
         * Updates the amount of nodes related to the selected nodes
         */
        async updateRelatedNodesCount(
            context: ActionContext<GraphEditorState, RootState>,
            uuid?: string,
        ): Promise<void> {
            const graphHandler = context.state.graphHandler;
            if (!graphHandler) return;

            // Load related nodes from db
            const res = await GET("/api/nodes/" + uuid + "/related");
            const apiNodes: ApiNode[] = await res.json();

            let count = 0;

            // Don't count nodes that are already in diagram
            for (const apiNode of apiNodes) {
                if (graphHandler.nodes.getByUuid(apiNode.nodeId).size == 0) {
                    count++;
                }
            }

            // Pass amount of nodes to mutation
            context.commit("updateRelatedNodesCount", count);
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
         *@return True if element is being in selection
         */
        itemSelected(state: GraphEditorState): boolean {
            return state.selectedElement !== undefined;
        },

        /**
         *@return Returns amount of related nodes to the selected node
         */
        relatedNodesAmount(state: GraphEditorState): number {
            return state.relatedNodesAmount;
        },
    },
};
