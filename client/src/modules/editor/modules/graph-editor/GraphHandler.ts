import { dia, shapes } from "jointjs";
import { Relation } from "./models/Relation";
import { Node } from "./models/Node";
import { SerializableGraph } from "@/modules/editor/modules/graph-editor/models/SerializableGraph";
import { ICommand } from "@/modules/editor/modules/graph-editor/UndoRedo/Commands/ICommand";
import { GraphActions } from "@/modules/editor/modules/graph-editor/UndoRedo/GraphActions";

export class GraphHandler {
    /**
     *  The redo stack
     */
    private redoStack = new Array<ICommand>();

    /**
     * The undo stack
     */
    private undoStack = new Array<ICommand>();

    /**
     * The nodes/elements of the diagram
     */
    public nodes = new Map<dia.Element, Node>();

    /**
     * The relations between the nodes of the diagram
     */
    public relations = new Map<shapes.standard.Link, Relation>();

    /**
     * The actual graph object from joint
     */
    public readonly graph: dia.Graph;

    /**
     * The paper object from joint
     */
    private readonly paper: dia.Paper;

    /**
     * Constructor
     *
     * @param graph The graph object from joint
     * @param paper The paper object from joint
     */
    constructor(graph: dia.Graph, paper: dia.Paper) {
        this.graph = graph;
        this.paper = paper;
    }

    /**
     * Create the diagram from the JSON string
     *
     * @param jsonString The diagram json value
     */
    public fromJSON(jsonString: string): void {
        const data: SerializableGraph = JSON.parse(jsonString);
        const nodes: Array<Node> = data.nodes;
        const relations: Array<Relation> = data.relations;

        // Create the nodes
        const mappedNodes = new Map<string, dia.Element>();
        nodes.forEach((node) => {
            const newNode = GraphActions.addNode(node, this);
            const ref = this.nodes.get(newNode);
            if (ref) mappedNodes.set(`${ref.ref.uuid}-${ref.ref.index}`, newNode);
        });

        // Create the relations
        relations.forEach((relation) => {
            const source = mappedNodes.get(`${relation.from.uuid}-${relation.from.index}`);
            const target = mappedNodes.get(`${relation.to.uuid}-${relation.to.index}`);
            if (source && target) GraphActions.addRelation(this, source, target, relation.uuid, relation.label);
        });

        // Rebuild the graph
        this.graph.clear();
        this.drawGraph();
    }

    /**
     *  Returns the diagram as JSON string
     */
    public toJSON(): string {
        // Prepare the serialization object for each node
        const nodes = new Array<Node>();
        this.nodes.forEach((value, key) => {
            nodes.push({
                label: value.label,
                ref: {
                    index: value.ref.index,
                    uuid: value.ref.uuid,
                },
                color: value.color,
                shape: value.shape,
                x: key.attributes.position.x,
                y: key.attributes.position.y,
            });
        });

        // Load the relations from the nodes
        const relations = new Array<Relation>();
        this.relations.forEach((value) => relations.push(value));

        // Compose the serializable graph and return the JSON string
        return JSON.stringify({
            nodes,
            relations,
        });
    }

    /**
     * Add a new commando to undo/redo queue
     * @param command Command to be executed
     */
    public addCommand(command: ICommand): void {
        // Add the new command to the undo stack/history
        this.undoStack.push(command);

        // Execute the currently pushed command
        command.Redo();
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
        if (!this.hasUndo()) return;

        // Get the most recently redone/executed command
        const command = this.undoStack.pop();
        command!.Undo();

        // Add the command to the available future redo commands
        this.redoStack.push(command!);
    }

    /**
     * Call the redo action
     */
    public Redo(): void {
        if (!this.hasRedo()) return;

        // Get the most recently undone command
        const command = this.redoStack.pop();

        // Execute the command
        command!.Redo();

        // Add the command to history
        this.undoStack.push(command!);
    }

    /**
     * Draws the graph
     */
    private drawGraph(): void {
        this.nodes.forEach((ref, diagElement) => {
            diagElement.addTo(this.graph);
        });

        this.relations.forEach((relation, link) => {
            link.addTo(this.graph);
        });
    }
}
