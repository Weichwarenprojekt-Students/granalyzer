import { Diagram } from "@/modules/start/models/Diagram";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { GET } from "@/utility";
import Label from "@/modules/editor/models/Label";
import Node from "@/modules/editor/models/Node";

export class EditorState {
    /**
     * The currently edited diagram
     */
    public diagram = {} as Diagram;

    /**
     * The id of the overview item that was selected last
     */
    public selectedItemId = "";

    /**
     * If set, user is allowed to drag items into the diagram
     */
    public canDragIntoDiagram = false;

    /**
     * Replication of the overview item that is dragged into the diagram
     */
    public lastDraggedContent = {} as Node;

    /**
     * Nodes in the customer db
     */
    public nodes = [] as Node[];

    /**
     * Labels in the customer db
     */
    public labels = [] as Label[];
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
        setSelectedItem(state: EditorState, itemId: string): void {
            state.selectedItemId = itemId;
        },
        /**
         * Set last dragged element
         */
        setLastDragged(state: EditorState, node: Node): void {
            state.lastDraggedContent = node;
        },
        /**
         * Set flag to enable/disable dragging into the diagram
         */
        setDragIntoDiagram(state: EditorState, dragged: boolean): void {
            state.canDragIntoDiagram = dragged;
        },
        /**
         * Stores the nodes
         */
        loadNodes(state: EditorState, nodes: Node[]): void {
            state.nodes = nodes;
        },
        /**
         * Stores the labels
         */
        loadLabels(state: EditorState, labels: Label[]): void {
            state.labels = labels;
        },
    },
    actions: {
        /**
         * Loads the nodes for the overview
         */
        async loadNodes(context: ActionContext<EditorState, RootState>): Promise<void> {
            const res = await GET("/api/nodes");

            if (res.status === 200) context.commit("loadNodes", await res.json());
        },
        /**
         * Get the color value for a specific node
         */
        async loadLabels(context: ActionContext<EditorState, RootState>): Promise<void> {
            const res = await GET("/api/data-scheme/label");

            if (res.status === 200) context.commit("loadLabels", await res.json());
        },
    },
};
