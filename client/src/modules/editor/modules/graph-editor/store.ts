import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { NodeInfo } from "./controls/models/NodeInfo";
import { ApiDiagram } from "@/models/ApiDiagram";
import { CreateNodeCommand } from "./controls/commands/CreateNodeCommand";
import { dia } from "jointjs";
import { RemoveNodeCommand } from "@/modules/editor/modules/graph-editor/controls/commands/RemoveNodeCommand";
import { GET, PUT } from "@/utility";
import { RelationInfo } from "./controls/models/RelationInfo";
import ApiRelation from "@/models/data-scheme/ApiRelation";
import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";

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
            context.commit("resetSelection");

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
    },
};
