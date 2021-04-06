import { dia, shapes } from "jointjs";
import { Relation } from "./models/Relation";
import { Node } from "./models/Node";
import { SerializableGraph } from "@/modules/editor/modules/graph-editor/undo-redo/models/SerializableGraph";
import { ICommand } from "@/modules/editor/modules/graph-editor/undo-redo/commands/ICommand";
import { GraphActions } from "@/modules/editor/modules/graph-editor/undo-redo/GraphActions";
import { JointGraph } from "@/modules/editor/modules/graph-editor/JointGraph";

export class GraphHandler {
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
     * Constructor
     *
     * @param graph The joint graph object
     */
    constructor(graph: JointGraph) {
        this.graph = graph;
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

        // Add the elements to the graph
        this.nodes.forEach((ref, diagElement) => diagElement.addTo(this.graph.graph));
        this.relations.forEach((relation, link) => link.addTo(this.graph.graph));
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
}
