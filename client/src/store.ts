import { ActionContext, createStore } from "vuex";
import { start, StartState } from "@/modules/start/store";
import { editor, EditorState } from "@/modules/editor/store";
import { inventory, InventoryState } from "@/modules/inventory/store";
import { Locales } from "@/i18n";
import { VueI18n } from "vue-i18n";
import ApiNode from "@/modules/editor/models/ApiNode";
import ApiLabel from "@/modules/editor/models/ApiLabel";
import { generateFilterString, GET, getBrightness } from "@/utility";

export class RootState {
    /**
     * The short form of the currently set language
     */
    public locale: string = navigator.language.split("-")[0];
    /**
     * True if the sidebar is minimized
     */
    public sidebarMinimized = false;

    /**
     * Start state
     */
    public start?: StartState;

    /**
     * Editor state
     */
    public editor?: EditorState;

    /**
     * Inventory state
     */
    public inventory?: InventoryState;

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
}

export default createStore({
    state: new RootState(),
    mutations: {
        /**
         * Dynamically set the active language
         */
        setLocale(state: RootState, payload: { i18n: VueI18n; lang: Locales }): void {
            if (Object.values(Locales).includes(payload.lang)) {
                state.locale = payload.lang;
                payload.i18n.locale = payload.lang;
            }
        },
        /**
         * Change the state of the sidebar
         */
        minimizeSidebar(state, value): void {
            state.sidebarMinimized = value;
        },
        /**
         * Stores the nodes
         */
        storeNodes(state: RootState, nodes: ApiNode[]): void {
            state.nodes = nodes;
        },
        /**
         * Extend the existing nodes
         */
        extendNodes(state: RootState, nodes: ApiNode[]): void {
            state.nodes.push(...nodes);
        },
        /**
         * Store the labels and create a color map for the label colors
         * with the matching font colors
         */
        storeLabels(state: RootState, labels: ApiLabel[]): void {
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
        async loadLabelsAndNodes(
            context: ActionContext<RootState, RootState>,
            filter: { userInput: string; labelsToFilterBy: Array<string> },
        ): Promise<void> {
            const filterString = generateFilterString(filter);

            const resNodes = await GET(`/api/nodes?limit=50${filterString}`);
            const resLabels = await GET("/api/data-scheme/label");

            if (resLabels.status === 200 && resNodes.status === 200) {
                context.commit("storeLabels", await resLabels.json());
                context.commit("storeNodes", await resNodes.json());
            }
        },
        /**
         * Extend the nodes
         */
        async extendNodes(
            context: ActionContext<RootState, RootState>,
            filter: { userInput: string; labelsToFilterBy: Array<string> },
        ): Promise<void> {
            const filterString = generateFilterString(filter);

            const resNodes = await GET(`/api/nodes?limit=50&offset=${context.state.nodes.length}${filterString}`);
            if (resNodes.status === 200) context.commit("extendNodes", await resNodes.json());
        },
    },
    getters: {
        /**
         * @return True if the nodes and the labels are loaded
         */
        nodesReady(state: RootState): boolean {
            return state.nodes.length > 0 && state.labels.length > 0;
        },
    },
    modules: {
        start,
        editor,
        inventory,
    },
});
