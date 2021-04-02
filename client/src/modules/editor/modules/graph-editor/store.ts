import { GraphHandler } from "@/modules/editor/modules/graph-editor/GraphHandler";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { Node } from "./models/Node";
import { Diagram } from "@/models/Diagram";

export class GraphEditorState {
    /**
     * The diagram changes that are saved for undo
     */
    public undoStack = [] as string[];
    /**
     * The diagram changes that are saved for redo
     */
    public redoStack = [] as string[];
    /**
     * The graph handler
     */
    public graphHandler = {} as GraphHandler;
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
            state.graphHandler.fromJSON(diagram.serialized);
        },
        /**
         * Change the active diagram
         */
        undo(state: GraphEditorState): void {
            const diagram = state.undoStack.pop();
            if (diagram) {
                state.redoStack.push(diagram);
                state.graphHandler.fromJSON(diagram);
            }
        },
        /**
         * Set selected item
         */
        redo(state: GraphEditorState): void {
            const diagram = state.redoStack.pop();
            if (diagram) {
                state.undoStack.push(diagram);
                state.graphHandler.fromJSON(diagram);
            }
        },
        /**
         * Add a node
         */
        addNode(state: GraphEditorState, node: Node): void {
            state.graphHandler.addNode(node);
        },
        /**
         * Add a new change to the undo stack
         */
        saveChange(state: GraphEditorState): void {
            state.redoStack = [];
            state.undoStack.push(state.graphHandler.toJSON());

            // Maybe place API Call to update Diagram here??
        },
    },
    actions: {
        /**
         * Undo a change
         */
        async undo(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            context.commit("undo");
        },
        /**
         * Redo a change
         */
        async redo(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            context.commit("redo");
        },
        /**
         * Add a node
         */
        async addNode(context: ActionContext<GraphEditorState, RootState>, node: Node): Promise<void> {
            context.commit("saveChange");
            context.commit("addNode", node);
        },
    },
    getters: {
        /**
         * @return True if undo is available
         */
        undoAvailable(state: GraphEditorState): boolean {
            return state.undoStack.length > 0;
        },
        /**
         * @return True if redo is available
         */
        redoAvailable(state: GraphEditorState): boolean {
            return state.redoStack.length > 0;
        },
    },
};
