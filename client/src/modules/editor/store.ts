import { Diagram } from "@/models/Diagram";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { GET, getBrightness } from "@/utility";
import ApiLabel from "@/modules/editor/models/ApiLabel";
import ApiNode from "@/modules/editor/models/ApiNode";
import { graphEditor, GraphEditorState } from "@/modules/editor/modules/graph-editor/store";

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
     * Nodes in the customer db
     */
    public nodes = new Array<ApiNode>();

    /**
     * Labels in the customer db
     */
    public labels = new Array<ApiLabel>();

    /**
     * Label/Color, FontColor Map
     */
    public labelColor = new Map() as Map<string, { color: string; fontColor: string }>;

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
        setActiveDiagram(state: EditorState, diagram: Diagram): void {
            state.diagram = diagram;
            // Store the active diagram ID in LocalStorage
            localStorage.setItem("current-diag-id", diagram.id.toString());
        },

        /**
         * Set selected item
         */
        setSelectedNode(state: EditorState, node?: ApiNode): void {
            state.selectedNode = node;
        },
        /**
         * Stores the nodes
         */
        storeNodes(state: EditorState, nodes: ApiNode[]): void {
            state.nodes = nodes;
        },
        /**
         * Extend the existing nodes
         */
        extendNodes(state: EditorState, nodes: ApiNode[]): void {
            state.nodes.push(...nodes);
        },
        /**
         * Store the labels and create a color map for the label colors
         * with the matching font colors
         */
        storeLabels(state: EditorState, labels: ApiLabel[]): void {
            state.labels = labels;
            labels.forEach((label) => {
                // Set the right font color depending on the brightness
                const brightness = getBrightness(label.color);
                const font = brightness > 170 ? "#333333" : "#FFFFFF";

                // Add label color and the font color to the color map
                state.labelColor.set(label.name, {
                    color: label.color,
                    fontColor: font,
                });
            });
        },
    },
    actions: {
        /**
         * Loads the labels and the first load of nodes
         */
        async loadLabels(context: ActionContext<EditorState, RootState>): Promise<void> {
            const resNodes = await GET("/api/nodes?limit=50");
            const resLabels = await GET("/api/data-scheme/label");

            if (resLabels.status === 200 && resNodes.status === 200) {
                context.commit("storeLabels", await resLabels.json());
                context.commit("storeNodes", await resNodes.json());
            }
        },
        /**
         * Extend the nodes
         * @param context
         */
        async extendNodes(context: ActionContext<EditorState, RootState>): Promise<void> {
            const resNodes = await GET(`/api/nodes?limit=50&offset=${context.state.nodes.length}`);
            if (resNodes.status === 200) context.commit("extendNodes", await resNodes.json());
        },

        /**
         * Loads the ID of the most recently opened diagram from LocalStorage,
         * fetches the diagram from the REST backend and sets it as the
         * active diagram
         */
        async fetchActiveDiagram(context: ActionContext<EditorState, RootState>): Promise<void> {
            // Get active diagram ID
            const id = localStorage.getItem("current-diag-id");
            if (!id) return;

            // Fetch the diagram model from the REST backend
            const result = await GET(`/api/diagrams/${id}`);

            // Unable to fetch diagram, remove ID from LocalStorage
            if (result.status !== 200) {
                localStorage.removeItem("current-diag-id");
                return;
            }

            // Set the active diagram
            const diagram: Diagram = await result.json();
            context.commit("setActiveDiagram", diagram);
        },
    },
    getters: {
        /**
         * @return True if the nodes and the labels are loaded
         */
        nodesReady(state: EditorState): boolean {
            return state.nodes.length > 0 && state.labels.length > 0;
        },
    },
    modules: {
        graphEditor,
    },
};
