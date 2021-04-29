import { RelationInfo } from "./relations/models/RelationInfo";
import { NodeInfo } from "./nodes/models/NodeInfo";
import { SerializableGraph } from "@/modules/editor/modules/graph-editor/controls/models/SerializableGraph";
import { ICommand } from "@/modules/editor/modules/graph-editor/controls/models/ICommand";
import { JointGraph } from "@/shared/JointGraph";
import { Store } from "vuex";
import { RootState } from "@/store";
import { GraphControls } from "@/modules/editor/modules/graph-editor/controls/GraphControls";
import { RelationModeControls } from "@/modules/editor/modules/graph-editor/controls/relation-mode/RelationModeControls";
import NodesController from "@/modules/editor/modules/graph-editor/controls/nodes/NodesController";
import RelationsController from "@/modules/editor/modules/graph-editor/controls/relations/RelationsController";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/relations/Relation";
import { RelationModeType } from "@/modules/editor/modules/graph-editor/controls/relations/models/RelationModeType";
import { HeatMapAttribute } from "@/modules/editor/modules/heatmap/models/HeatMapAttribute";

export class GraphHandler {
    /**
     * The nodes/elements of the diagram
     */
    public nodes = new NodesController(this);
    /**
     * The relations between the nodes of the diagram
     */
    public relations: RelationsController;
    /**
     * The extended controls for the graph
     */
    public controls: GraphControls;
    /**
     * The controls for the relation mode
     */
    public relationMode: RelationModeControls;
    /**
     * The actual graph object from joint
     */
    public readonly graph: JointGraph;
    /**
     *  The redo stack
     */
    private redoStack = new Array<ICommand>();
    /**
     * The undo stack
     */
    private undoStack = new Array<ICommand>();

    /**
     * Label-name, HeatMapAttribute
     */
    private heatMapAttributes = new Map<string, HeatMapAttribute>();

    /**
     * Constructor
     *
     * @param store The vuex store
     * @param graph The joint graph object
     */
    constructor(private store: Store<RootState>, graph: JointGraph) {
        this.graph = graph;

        this.relations = new RelationsController(this, store);

        this.controls = new GraphControls(this, store);
        this.relationMode = new RelationModeControls(this, store);

        this.registerPaperEvents();
    }

    /**
     * Create the diagram from the JSON string
     *
     * @param jsonString The diagram json value
     */
    public fromJSON(jsonString: string): void {
        if (!jsonString || jsonString === "{}") return;

        const data: SerializableGraph = JSON.parse(jsonString);
        const nodes: Array<NodeInfo> = data.nodes;
        const relations: Array<RelationInfo> = data.relations;

        nodes.forEach((node) => {
            // Get color for the label of the node for updating the diagram if the color changed
            const labelColor = this.store.state.overview?.labelColor.get(node.label)?.color;

            // Create new node
            this.nodes.new(node, labelColor);
        });

        // Create the relations
        relations.forEach((relation) => {
            // Get source and target nodes of the relation
            const source = this.nodes.getByReference(relation.from.uuid, relation.from.index);
            const target = this.nodes.getByReference(relation.to.uuid, relation.to.index);

            if (source && target) {
                // If both source and target exist, create new relation
                const newRel = this.relations.new(
                    source,
                    target,
                    RelationModeType.NORMAL,
                    relation.label,
                    relation.uuid,
                );

                // And set vertices of the new relation, if they were saved
                if (relation.vertices != null) newRel.vertices = relation.vertices;
                if (relation.anchors != null) newRel.anchors = relation.anchors;
            }
        });
    }

    /**
     *  Returns the diagram as JSON string
     */
    public toJSON(): string {
        // Prepare the serialization object for each node
        const nodes: Array<NodeInfo> = Array.from(this.nodes, (node) => {
            // Get current position of the element
            const { x, y } = node.jointElement.position();

            return {
                ...node.nodeInfo,
                x,
                y,
            } as NodeInfo;
        });

        // Map normal and visual relations to an array
        const relations: RelationInfo[] = Array.from(this.relations.savableRelations(), (relation: Relation) => {
            return {
                ...relation.relationInfo,
                vertices: relation.vertices,
                anchors: relation.anchors,
            } as RelationInfo;
        });

        // Compose the serializable graph and return the JSON string
        return JSON.stringify({
            nodes,
            relations,
        } as SerializableGraph);
    }

    /**
     * Add a new commando to undo/redo queue
     * @param command Command to be executed
     */
    public addCommand(command: ICommand): void {
        // Add command to the undo list and execute it
        this.undoStack.push(command);
        command.redo();

        // Clear the redo stack
        this.redoStack = [];
    }

    /**
     * Returns if there are redo-actions to perform
     */
    public hasRedo(): boolean {
        return this.redoStack.length > 0;
    }

    /**
     *  Returns if there are undo-actions to perform
     */
    public hasUndo(): boolean {
        return this.undoStack.length > 0;
    }

    /**
     * Call the undo action
     */
    public Undo(): void {
        const command = this.undoStack.pop();
        if (command) {
            command.undo();
            this.redoStack.push(command);
        }
    }

    /**
     * Call the redo action
     */
    public Redo(): void {
        // Get the most recently undone command
        const command = this.redoStack.pop();
        if (command) {
            command.redo();
            this.undoStack.push(command);
        }
    }

    /**
     * Register callbacks to joint js events
     * @private
     */
    private registerPaperEvents(): void {
        this.graph.paper.on({
            // Reset selection when clicking on a blank paper space
            "blank:pointerclick": () => {
                this.controls.resetSelection();
            },
            // Select node and begin registering a node movement
            "element:pointerdown": async (elementView) => {
                this.controls.startNodeMovement(elementView);
                await this.controls.selectNode(elementView);
            },
            // Stop registering node movement
            "element:pointerup": async () => {
                await this.controls.stopNodeMovement();
            },
            // Pass element click to relation mode for handling the drawing of visual relations
            "element:pointerclick": async (elementView, evt, x, y) => {
                await this.relationMode.elementClick(elementView, evt, x, y);
            },
            // Select relation or switch it, depending on the state of the relation mode
            "link:pointerdown": async (linkView) => {
                await this.controls.selectRelation(linkView);

                await this.relationMode.switchRelation(linkView);
            },
            // Register BendRelationCommand and display link tools
            "link:mouseenter": (linkView) => {
                // Start dragging a vertex
                this.controls.startBendingRelation(linkView);

                this.controls.showLinkTools(linkView);
            },
            // Stop registering bending of relations and hide link tools
            "link:mouseleave": async (linkView) => {
                await this.controls.stopBendingRelation();

                this.controls.hideLinkTools(linkView);
            },
            // Register changes of relation connections
            "link:connect": async (linkView) => {
                await this.relationMode.connectRelation(linkView);
            },
        });
    }

    setHeatMapAttribute(heatMapAttribute: HeatMapAttribute): void {
        this.heatMapAttributes.set(heatMapAttribute.labelName, heatMapAttribute);
    }

    dropHeatMapAttribute(heatMapAttribute: HeatMapAttribute): void {
        this.heatMapAttributes.delete(heatMapAttribute.labelName);
    }

    /**
     * Returns all label names which are listed as an heatmap attribute
     */
    getActiveHeatMapLabels(): string[] {
        const labels: string[] = [];
        this.heatMapAttributes.forEach((heatMapAttribute: HeatMapAttribute) => labels.push(heatMapAttribute.labelName));
        return labels;
    }
}
