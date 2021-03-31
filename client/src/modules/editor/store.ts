import { Diagram } from "@/modules/start/models/Diagram";
import { ActionContext } from "vuex";
import { RootState } from "@/store";

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

    /**
     * Mock customer-db content
     */
    public mockContent = [
        {
            label: "Label1",
            color: "#6fcf97",
            nodes: [
                { name: "Node1", id: "1" },
                { name: "Node2", id: "2" },
                { name: "Node3", id: "3" },
            ],
        },
        {
            label: "Label2",
            color: "#008DDD",
            nodes: [
                { name: "Node4", id: "4" },
                { name: "Node5", id: "5" },
                { name: "Node6", id: "6" },
            ],
        },
        {
            label: "Label3",
            color: "#FFA726",
            nodes: [
                { name: "Node7", id: "7" },
                { name: "Node8", id: "8" },
                { name: "Node9", id: "9" },
            ],
        },
        {
            label: "Label4",
            color: "#FF4D26",
            nodes: [
                { name: "Node10", id: "10" },
                { name: "Node11", id: "11" },
                { name: "Node12", id: "12" },
            ],
        },
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
    },
    actions: {
        /**
         * Change the active diagram
         */
        setDiagram(context: ActionContext<EditorState, RootState>, diagram: Diagram): void {
            context.commit("setDiagram", diagram);
        },
    },
};
