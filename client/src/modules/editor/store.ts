import { Diagram } from "@/models/Diagram";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { GET, getBrightness } from "@/utility";
import Label from "@/modules/editor/models/Label";
import Node from "@/modules/editor/models/Node";
import { graphEditor } from "@/modules/editor/modules/graph-editor/store";

export class EditorState {
    /**
     * The currently edited diagram
     */
    public diagram = new Diagram("") as Diagram;

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

    /**
     * Label/Color, FontColor Map
     */
    public labelColor = new Map() as Map<string, { color: string; fontColor: string }>;
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
        storeNodes(state: EditorState, nodes: Node[]): void {
            state.nodes = nodes;
        },
        /**
         * Extend the existing nodes
         */
        extendNodes(state: EditorState, nodes: Node[]): void {
            state.nodes.push(...nodes);
        },
        /**
         * Store the labels and create a color map for the label colors
         * with the matching font colors
         */
        storeLabels(state: EditorState, labels: Label[]): void {
            state.labels = labels;
            labels.forEach((label) => {
                if (label.name && label.color) {
                    // Set the right font color depending on the brightness
                    const brightness = getBrightness(label.color);
                    const font = brightness > 170 ? "#333333" : "#FFFFFF";

                    // Add label color and the font color to the color map
                    state.labelColor.set(label.name, {
                        color: label.color,
                        fontColor: font,
                    });
                }
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
