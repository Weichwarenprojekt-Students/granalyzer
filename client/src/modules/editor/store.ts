import { Diagram } from "@/models/Diagram";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { GET } from "@/utility";
import ApiNode from "@/modules/editor/models/ApiNode";
import { graphEditor, GraphEditorState } from "@/modules/editor/modules/graph-editor/store";

/**
 * The local storage key for the opened diagram in the editor
 */
const currentDiagramKey = "current-diag-id";

export class EditorState {
    /**
     * The currently active diagram object
     */
    public diagram?: Diagram;

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
         * Set the active diagram object
         */
        setActiveDiagram(state: EditorState, diagram?: Diagram): void {
            state.diagram = diagram;
            if (diagram) localStorage.setItem(currentDiagramKey, diagram.diagramId);
        },
        /**
         * Set selected item
         */
        setSelectedNode(state: EditorState, node?: ApiNode): void {
            state.selectedNode = node;
        },
    },
    actions: {
        /**
         * Loads the ID of the most recently opened diagram from LocalStorage,
         * fetches the diagram from the REST backend and sets it as the
         * active diagram
         */
        async fetchActiveDiagram(context: ActionContext<EditorState, RootState>): Promise<void> {
            // Get active diagram ID
            const id = localStorage.getItem(currentDiagramKey);
            if (!id) return;

            // Fetch the diagram model from the REST backend
            const result = await GET(`/api/diagrams/${id}`);

            // Unable to fetch diagram, remove ID from LocalStorage
            if (result.status !== 200) {
                context.commit("setActiveDiagram");
                localStorage.removeItem(currentDiagramKey);
                return;
            }

            // Set the active diagram
            const diagram: Diagram = await result.json();
            context.commit("setActiveDiagram", diagram);
        },
    },
    modules: {
        graphEditor,
    },
};
