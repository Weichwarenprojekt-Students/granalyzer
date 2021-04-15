import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { ActionContext } from "vuex";
import { RootState } from "@/store";
import { Node } from "./controls/models/Node";
import { Diagram } from "@/models/Diagram";
import { CreateNodeCommand } from "./controls/commands/CreateNodeCommand";
import { dia } from "jointjs";
import { RemoveNodeCommand } from "@/modules/editor/modules/graph-editor/controls/commands/RemoveNodeCommand";
import { GET, PUT } from "@/utility";
import { Relation } from "./controls/models/Relation";
import { MoveNodeCommand } from "@/modules/editor/modules/graph-editor/controls/commands/MoveNodeCommand";
import ApiRelation from "@/modules/editor/models/ApiRelation";
import { EnableDbRelationCommand } from "@/modules/editor/modules/graph-editor/controls/commands/EnableDbRelationCommand";
import { DisableDbRelationCommand } from "@/modules/editor/modules/graph-editor/controls/commands/DisableDbRelationCommand";
import { BendRelationCommand } from "@/modules/editor/modules/graph-editor/controls/commands/BendRelationCommand";

export class GraphEditorState {
    /**
     * The graph handler
     */
    public graphHandler?: GraphHandler;

    /**
     * The diagram element which has been clicked most recently
     */
    public selectedElement?: dia.Element;

    /**
     * True if the graph editor is currently loading
     */
    public editorLoading = false;

    /**
     * True if the relation edit mode is active
     */
    public relationModeActive = false;
}

export const graphEditor = {
    state: new GraphEditorState(),
    mutations: {
        /**
         * Set the active diagram handler
         */
        setGraphHandler(state: GraphEditorState, graphHandler: GraphHandler): void {
            state.graphHandler = graphHandler;
        },
        /**
         * Set the active diagram
         */
        generateDiagramFromJSON(state: GraphEditorState, diagram: Diagram): void {
            if (state.graphHandler) state.graphHandler.fromJSON(diagram.serialized);
        },

        /**
         * Set the clicked diagram element
         */
        setSelectedElement(state: GraphEditorState, diagElement?: dia.Element): void {
            state.selectedElement = diagElement;
        },

        /**
         * Add command for changed vertices to the undo redo stack
         */
        addMoveCommand(state: GraphEditorState, moveCommand: MoveNodeCommand): void {
            if (state.graphHandler) state.graphHandler.addCommand(moveCommand);
        },

        /**
         * Change the active diagram
         */
        undo(state: GraphEditorState): void {
            state.graphHandler?.Undo();
        },
        /**
         * Set selected item
         */
        redo(state: GraphEditorState): void {
            state.graphHandler?.Redo();
        },
        /**
         * Add a node
         */
        addNode(state: GraphEditorState, payload: [node: Node, rels: Relation[]]): void {
            if (state.graphHandler) {
                const command = new CreateNodeCommand(state.graphHandler, payload[0], payload[1]);
                state.graphHandler.addCommand(command);
            }
        },
        /**
         * Remove a node
         */
        removeNode(state: GraphEditorState): void {
            if (state.graphHandler && state.selectedElement) {
                const command = new RemoveNodeCommand(state.graphHandler, state.selectedElement);
                state.graphHandler.addCommand(command);
            }
            state.selectedElement = undefined;
        },
        /**
         * Active/Deactivate the loading state
         */
        setEditorLoading(state: GraphEditorState, loading: boolean): void {
            state.editorLoading = loading;
        },
        /**
         * Activate/Deactivate the relation edit mode
         */
        setRelationMode(state: GraphEditorState, value: boolean): void {
            if (!state.graphHandler) {
                state.relationModeActive = false;
                return;
            }

            // Deselect elements
            state.graphHandler.graph.deselectElements();
            state.relationModeActive = value;
        },
        /**
         * Enable a DB relation
         */
        enableDbRelation(state: GraphEditorState, link: dia.Element): void {
            if (state.graphHandler) {
                const relation = state.graphHandler.faintRelations.get(link.id);
                if (relation) {
                    const command = new EnableDbRelationCommand(state.graphHandler, link, relation);
                    state.graphHandler.addCommand(command);
                }
            }
        },
        /**
         * Disable a DB relation
         */
        disableDbRelation(state: GraphEditorState, link: dia.Element): void {
            if (state.graphHandler) {
                const relation = state.graphHandler.relations.get(link.id);
                if (relation) {
                    const command = new DisableDbRelationCommand(state.graphHandler, link, relation);
                    state.graphHandler.addCommand(command);
                }
            }
        },

        /**
         * Add command for changed vertices to the undo redo stack
         */
        addBendRelationCommand(state: GraphEditorState, bendCommand: BendRelationCommand): void {
            state.graphHandler?.addCommand(bendCommand);
        },
    },
    actions: {
        /**
         * Undo a change
         */
        async undo(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            context.commit("setEditorLoading", true);
            await context.dispatch("setRelationMode", false);
            context.commit("undo");
            context.commit("setEditorLoading", false);

            await context.dispatch("saveChange");
        },
        /**
         * Redo a change
         */
        async redo(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            context.commit("setEditorLoading", true);
            await context.dispatch("setRelationMode", false);
            context.commit("redo");
            context.commit("setEditorLoading", false);

            await context.dispatch("saveChange");
        },
        /**
         * Add a node with its relations
         */
        async addNode(context: ActionContext<GraphEditorState, RootState>, node: Node): Promise<void> {
            context.commit("setEditorLoading", true);

            // Perform api request
            const res = await GET("/api/nodes/" + node.ref.uuid + "/relations");
            const newVar: ApiRelation[] = await res.json();

            // Transform relations from api into Relation objects
            const relations: Relation[] = newVar.map((rel) => {
                return {
                    from: { uuid: rel.from, index: 0 },
                    to: { uuid: rel.to, index: 0 },
                    uuid: rel.relationId,
                    type: rel.type,
                };
            });
            context.commit("addNode", [node, relations]);
            context.commit("setEditorLoading", false);

            await context.dispatch("saveChange");
        },
        /**
         * Remove a node
         */
        async removeNode(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            context.commit("setEditorLoading", true);
            context.commit("removeNode");
            context.commit("setEditorLoading", false);

            await context.dispatch("saveChange");
        },

        /**
         * Add move command to the undo redo stack
         */
        async addMoveCommand(
            context: ActionContext<GraphEditorState, RootState>,
            moveCommand: MoveNodeCommand,
        ): Promise<void> {
            context.commit("addMoveCommand", moveCommand);
            await context.dispatch("saveChange");
        },

        /**
         * Save changes to backend
         */
        async saveChange(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            const graph = context.state.graphHandler?.toJSON();

            if (graph) {
                const diagram = context.rootState.editor?.diagram;
                if (!diagram) return;
                diagram.serialized = graph;

                await PUT("/api/diagrams/" + diagram.diagramId, JSON.stringify(diagram));
            }
        },

        /**
         * Set the relation edit mode to a certain value
         */
        async setRelationMode(context: ActionContext<GraphEditorState, RootState>, value: boolean): Promise<void> {
            context.commit("setSelectedElement", undefined);
            context.commit("setRelationMode", value);
        },

        /**
         * Toggle the relation edit mode
         */
        async toggleRelationMode(context: ActionContext<GraphEditorState, RootState>): Promise<void> {
            await context.dispatch("setRelationMode", !context.state.relationModeActive);
        },

        /**
         * Enable a DB relation
         */
        async enableDbRelation(
            context: ActionContext<GraphEditorState, RootState>,
            relation: dia.Element,
        ): Promise<void> {
            context.commit("setEditorLoading", true);
            context.commit("enableDbRelation", relation);
            context.commit("setEditorLoading", false);
            await context.dispatch("saveChange");
        },

        /**
         * Disable a DB relation
         */
        async disableDbRelation(
            context: ActionContext<GraphEditorState, RootState>,
            relation: dia.Element,
        ): Promise<void> {
            context.commit("setEditorLoading", true);
            context.commit("disableDbRelation", relation);
            context.commit("setEditorLoading", false);
            await context.dispatch("saveChange");
        },

        /**
         * Add command for changed vertices to the undo redo stack
         */
        async addBendRelationCommand(
            context: ActionContext<GraphEditorState, RootState>,
            bendCommand: BendRelationCommand,
        ): Promise<void> {
            context.commit("addBendRelationCommand", bendCommand);
            await context.dispatch("saveChange");
        },
    },
    getters: {
        /**
         * @return True if undo is available
         */
        undoAvailable(state: GraphEditorState): boolean {
            return !!state.graphHandler?.hasUndo();
        },
        /**
         * @return True if redo is available
         */
        redoAvailable(state: GraphEditorState): boolean {
            return !!state.graphHandler?.hasRedo();
        },

        /**
         *@return True if element is being in selection
         */
        itemSelected(state: GraphEditorState): boolean {
            return state.selectedElement !== undefined;
        },
    },
};
