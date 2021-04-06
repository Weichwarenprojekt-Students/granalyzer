import { Diagram } from "@/models/Diagram";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { GET } from "@/utility";
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
     * Limit of nodes to be loaded
     */
    public limit = 50;

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
        loadNodes(state: EditorState, nodes: Node[]): void {
            state.nodes = nodes;
        },
        /**
         * Stores the labels
         */
        loadLabels(state: EditorState, labels: Label[]): void {
            state.labels = labels;
        },
        /**
         * Creates a map of labels, colors and the most fitting font color
         */
        loadLabelColors(state: EditorState, labels: Label[]): void {
            labels.forEach((label) => {
                let brightness = 0;

                if (label.name && label.color) {
                    // Remove "#" from hex-code
                    const parsedHex = parseInt(label.color.substr(1), 16);
                    if (parsedHex) {
                        // Get R, G, B values from hex-code
                        const R = (parsedHex >> 16) & 255;
                        const G = (parsedHex >> 8) & 255;
                        const B = parsedHex & 255;
                        // Calculate color brightness from RGB-values
                        brightness = R * 0.299 + G * 0.587 + B * 0.114;
                    }

                    // Black font color, if brightness is above 50%
                    const font = brightness > 170 ? "#333333" : "#FFFFFF";

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
         * Loads the nodes and color values for the overview
         */
        async loadNodesAndLabels(context: ActionContext<EditorState, RootState>, extend: boolean): Promise<void> {
            if (extend) context.state.limit += 50;
            const resNodes = await GET("/api/nodes?limit=" + context.state.limit);
            const resLabels = await GET("/api/data-scheme/label");

            if (resLabels.status === 200 && resNodes.status === 200) {
                const data = await resLabels.json();
                context.commit("loadLabelColors", data);
                context.commit("loadLabels", data);
                context.commit("loadNodes", await resNodes.json());
            }
        },
    },
    modules: {
        graphEditor,
    },
};
