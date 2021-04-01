import { Diagram } from "@/modules/start/models/Diagram";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { GET } from "@/utility";

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
    public lastDraggedContent = {} as { label: string; name: string; id: number; color: string };

    public nodes = [] as Node[];
    /**
     * Mock customer-db content
     */
    public mockContent = [
        { name: "Node1", label: "label1", attributes: [], id: 1 },
        { name: "Node2", label: "label1", attributes: [], id: 2 },
        { name: "Node3", label: "label1", attributes: [], id: 3 },
        { name: "Node4", label: "label1", attributes: [], id: 4 },
        { name: "Node5", label: "label2", attributes: [], id: 5 },
        { name: "Node6", label: "label2", attributes: [], id: 6 },
        { name: "Node7", label: "label2", attributes: [], id: 7 },
        { name: "Node8", label: "label2", attributes: [], id: 8 },
        { name: "Node9", label: "label3", attributes: [], id: 9 },
        { name: "Node10", label: "label3", attributes: [], id: 10 },
        { name: "Node11", label: "label3", attributes: [], id: 11 },
        { name: "Node12", label: "label3", attributes: [], id: 12 },
    ];
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
        setLastDragged(state: EditorState, payload: { label: string; name: string; id: number; color: string }): void {
            state.lastDraggedContent = payload;
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
            console.log("loading " + nodes + " into " + state);
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
    },
};
