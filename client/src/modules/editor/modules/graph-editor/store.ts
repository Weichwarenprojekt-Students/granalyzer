import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { Node } from "./controls/models/Node";
import { Diagram } from "@/models/Diagram";
import { CreateNodeCommand } from "./controls/commands/CreateNodeCommand";
import { dia } from "jointjs";
import { RemoveNodeCommand } from "@/modules/editor/modules/graph-editor/controls/commands/RemoveNodeCommand";
import { GET } from "@/utility";
import { Relation } from "./controls/models/Relation";
import { MoveNodeCommand } from "@/modules/editor/modules/graph-editor/controls/commands/MoveNodeCommand";
import ApiRelation from "@/modules/editor/models/ApiRelation";

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
        setDiagram(state: GraphEditorState, diagram: Diagram): void {
            if (state.graphHandler) state.graphHandler.fromJSON(diagram.serialized);
        },

        /**
         * Set the clicked diagram element
         */
        setSelectedElement(state: GraphEditorState, diagElement?: dia.Element): void {
            state.selectedElement = diagElement;
        },

        /**
         * Set the unselected diagram element
         */
        addMoveCommand(state: GraphEditorState, moveCommand: MoveNodeCommand): void {
            if (state.graphHandler) state.graphHandler.addCommand(moveCommand);
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
        addNode(state: GraphEditorState, payload: [node: Node, rels: Relation[]]): void {
            if (state.graphHandler) {
                const command = new CreateNodeCommand(state.graphHandler, payload[0], payload[1]);
                state.graphHandler.addCommand(command);
            }
        },
        /**
         * Remove a node
         */
        removeNode(state: GraphEditorState): void {
            if (state.graphHandler && state.selectedElement) {
                const command = new RemoveNodeCommand(state.graphHandler, state.selectedElement);
                state.graphHandler.addCommand(command);
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
         * Save the data to backend
         */
        saveChange(state: GraphEditorState): void {
            // Log the graph as a nested object so that it doesn't completely cover the console
            const graph = state.graphHandler?.toJSON();
            console.log({
                msg: "Saved graph",
                graph: {
                    value: graph,
                },
            });
            // TODO: Save JSON config with REST backend!
        },
    },
    actions: {
        /**
         * Undo a change
         */
        async undo(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            context.commit("setEditorLoading", true);
            context.commit("undo");
            context.commit("setEditorLoading", false);
            context.commit("saveChange");
        },
        /**
         * Redo a change
         */
        async redo(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            context.commit("setEditorLoading", true);
            context.commit("redo");
            context.commit("setEditorLoading", false);
            context.commit("saveChange");
        },
        /**
         * Add a node with its relations
         */
        async addNode(context: ActionContext<GraphEditorState, RootState>, node: Node): Promise<void> {
            context.commit("setEditorLoading", true);

            // Perform api request
            const res = await GET("/api/nodes/" + node.ref.uuid + "/relations");
            const newVar: ApiRelation[] = await res.json();

            // Transform relations from api into Relation objects
            const relations: Relation[] = newVar.map((rel) => {
                return {
                    from: { uuid: rel.from, index: 0 },
                    to: { uuid: rel.to, index: 0 },
                    uuid: rel.id,
                    type: rel.type,
                };
            });
            context.commit("addNode", [node, relations]);
            context.commit("setEditorLoading", false);
            context.commit("saveChange");
        },

        /**
         * Remove a node
         */
        async removeNode(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            context.commit("setEditorLoading", true);
            context.commit("removeNode");
            context.commit("saveChange");
            context.commit("setEditorLoading", false);
        },
    },
    getters: {
        /**
         * @return True if undo is available
         */
        undoAvailable(state: GraphEditorState): boolean {
            if (state.graphHandler) return state.graphHandler.hasUndo();
            else return false;
        },
        /**
         * @return True if redo is available
         */
        redoAvailable(state: GraphEditorState): boolean {
            if (state.graphHandler) return state.graphHandler.hasRedo();
            else return false;
        },

        /**
         *@return True if element is being in selection
         */
        itemSelected(state: GraphEditorState): boolean {
            return state.selectedElement !== undefined;
        },
    },
};
