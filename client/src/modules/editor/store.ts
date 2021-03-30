import { Diagram } from "@/modules/start/models/Diagram";
import { ActionContext } from "vuex";
import { RootState } from "@/store";

export class EditorState {
    /**
     * The currently edited diagram
     */
    public diagram = {} as Diagram;

    public mockContent = [
        {
            label: "Label1",
            nodes: [
                { name: "Node1", id: "1" },
                { name: "Node2", id: "2" },
                { name: "Node3", id: "3" },
            ],
        },
        {
            label: "Label2",
            nodes: [
                { name: "Node4", id: "4" },
                { name: "Node5", id: "5" },
                { name: "Node6", id: "6" },
            ],
        },
        {
            label: "Label3",
            nodes: [
                { name: "Node7", id: "7" },
                { name: "Node8", id: "8" },
                { name: "Node9", id: "9" },
            ],
        },
        {
            label: "Label4",
            nodes: [
                { name: "Node10", id: "10" },
                { name: "Node11", id: "11" },
                { name: "Node12", id: "12" },
            ],
        },
    ];

    public selectedItemId = "" as string;
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
