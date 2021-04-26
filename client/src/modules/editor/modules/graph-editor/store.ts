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
            if (state.graphHandler) for (const node of state.graphHandler?.nodes) labels.add(node.nodeInfo.label);
            return labels;
        },
    },
};
