import { GraphHandler } from "@/modules/editor/modules/graph-editor/GraphHandler";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { Node } from "./models/Node";
import { Diagram } from "@/models/Diagram";
import { CreateNodeCommand } from "./UndoRedo/Commands/CreateNodeCommand";
import { isEmpty } from "@/utility";
import { dia } from "jointjs";
import { RemoveNodeCommand } from "@/modules/editor/modules/graph-editor/UndoRedo/Commands/RemoveNodeCommand";

export class GraphEditorState {
    /**
     * The graph handler
     */
    public graphHandler = {} as GraphHandler;

    /**
     * The diagram element which has been clicked most recently
     */
    public lastSelectedElement = {} as dia.Element;

    /**
     *  Stores if a element is being in selection
     */
    public itemSelected = false;
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
         * Set the clicked diagram element
         */
        setClickedItem(state: GraphEditorState, diagElement: dia.Element): void {
            state.lastSelectedElement = diagElement;
        },

        /**
         * Set if the user clicked an element or the canvas background
         */
        setIfSelected(state: GraphEditorState, value: boolean): void {
            state.itemSelected = value;
        },

        /**
         * Change the active diagram
         */
        undo(state: GraphEditorState): void {
            state.graphHandler.Undo();
        },
        /**
         * Set selected item
         */
        redo(state: GraphEditorState): void {
            state.graphHandler.Redo();
        },
        /**
         * Add a node
         */
        addNode(state: GraphEditorState, node: Node): void {
            const command = new CreateNodeCommand(state.graphHandler, node);
            state.graphHandler.addCommand(command);
        },

        /**
         * Remove a node
         */
        removeNode(state: GraphEditorState): void {
            const command = new RemoveNodeCommand(state.graphHandler, state.lastSelectedElement);
            state.graphHandler.addCommand(command);
        },

        /**
         * Save the data to backend
         */
        saveChange(state: GraphEditorState): void {
            // TODO: Save JSON config with REST backend!
        },
    },
    actions: {
        /**
         * Undo a change
         */
        async undo(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            context.commit("saveChange");
            context.commit("undo");
        },
        /**
         * Redo a change
         */
        async redo(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            context.commit("saveChange");
            context.commit("redo");
        },
        /**
         * Add a node
         */
        async addNode(context: ActionContext<GraphEditorState, RootState>, node: Node): Promise<void> {
            context.commit("saveChange");
            context.commit("addNode", node);
        },

        /**
         * Remove a node
         */
        async removeNode(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            context.commit("saveChange");
            context.commit("removeNode");
        },
    },
    getters: {
        /**
         * @return True if undo is available
         */
        undoAvailable(state: GraphEditorState): boolean {
            if (!isEmpty(state.graphHandler)) return state.graphHandler.hasUndo();
            else return false;
        },
        /**
         * @return True if redo is available
         */
        redoAvailable(state: GraphEditorState): boolean {
            if (!isEmpty(state.graphHandler)) return state.graphHandler.hasRedo();
            else return false;
        },

        /**
         *@return True if element is being in selection
         */
        itemSelected(state: GraphEditorState): boolean {
            return state.itemSelected;
        },
    },
};
