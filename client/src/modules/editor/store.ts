import { Diagram } from "@/models/Diagram";
import ApiNode from "@/modules/editor/models/ApiNode";
import { graphEditor, GraphEditorState } from "@/modules/editor/modules/graph-editor/store";

export class EditorState {
    /**
     * The currently edited diagram
     */
    public diagram = new Diagram("") as Diagram;

    /**
     * Replication of the overview item that is dragged into the diagram
     */
    public selectedNode?: ApiNode;

    /**
     * Graph editor state
     */
    public graphEditor?: GraphEditorState;
}

export const editor = {
    namespaced: true,
    state: new EditorState(),
    mutations: {
        /**
         * Change the active diagram
         */
        setDiagram(state: EditorState, diagram: Diagram): void {
            state.diagram = diagram;
        },
        /**
         * Set selected item
         */
        setSelectedNode(state: EditorState, node?: ApiNode): void {
            state.selectedNode = node;
        },
    },
    modules: {
        graphEditor,
    },
};
