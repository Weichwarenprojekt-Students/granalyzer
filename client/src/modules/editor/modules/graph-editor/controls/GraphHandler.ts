import { dia } from "jointjs";
import { Relation } from "./models/Relation";
import { Node } from "./models/Node";
import { SerializableGraph } from "@/modules/editor/modules/graph-editor/controls/models/SerializableGraph";
import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";
import { JointGraph } from "@/shared/JointGraph";
import { Store } from "vuex";
import { RootState } from "@/store";
import { GraphControls } from "@/modules/editor/modules/graph-editor/controls/GraphControls";
import { RelationModeControls } from "@/modules/editor/modules/graph-editor/controls/RelationModeControls";

export class GraphHandler {
    /**
     * Color for normal relations
     */
    public readonly NORMAL_RELATION_COLOR = "#333";
    /**
     * Color for visual relations
     */
    public readonly VISUAL_RELATION_COLOR = "#b33";
    /**
     * Color for faint DB relations
     */
    public readonly FAINT_RELATION_COLOR = "#bbb";
    /**
     * The nodes/elements of the diagram
     */
    public nodes = new Map<string | number, Node>();
    /**
     * The relations between the nodes of the diagram
     */
    public relations = new Map<string | number, Relation>();
    /**
     * Relations from the DB that are not "in" the diagram, but are shown in relation edit mode
     */
    public faintRelations = new Map<string | number, Relation>();
    /**
     * Relations that have no counterpart in the DB are moved here during relation mode and displayed in a different color
     */
    visualRelations = new Map<string | number, Relation>();
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
     * Constructor
     *
     * @param store The vuex store
     * @param graph The joint graph object
     */
    constructor(store: Store<RootState>, graph: JointGraph) {
        this.graph = graph;
        this.controls = new GraphControls(this, store);
        this.relationMode = new RelationModeControls(this, store);
    }

    /**
     * Create the diagram from the JSON string
     *
     * @param jsonString The diagram json value
     */
    public fromJSON(jsonString: string): void {
        if (!jsonString || jsonString === "{}") return;

        const data: SerializableGraph = JSON.parse(jsonString);
        const nodes: Array<Node> = data.nodes;
        const relations: Array<Relation> = data.relations;

        // Create the nodes
        const mappedNodes = new Map<string, dia.Element>();
        nodes.forEach((node) => {
            const newNode = this.controls.addNode(node);
            const ref = this.nodes.get(newNode.id);
            if (ref) mappedNodes.set(`${ref.ref.uuid}-${ref.ref.index}`, newNode);
        });

        // Create the relations
        relations.forEach((relation) => {
            const source = mappedNodes.get(`${relation.from.uuid}-${relation.from.index}`);
            const target = mappedNodes.get(`${relation.to.uuid}-${relation.to.index}`);
            if (source && target) {
                const newRelId = this.controls.addRelation(source, target, relation.uuid, relation.type);
                if (newRelId && relation.vertices !== undefined)
                    this.getLinkById(newRelId)?.vertices(relation.vertices);
            }
        });
    }

    /**
     *  Returns the diagram as JSON string
     */
    public toJSON(): string {
        // Prepare the serialization object for each node
        const nodes: Array<Node> = Array.from(this.nodes, ([id, node]) => {
            const diagEl = this.getCellById(id);
            return {
                label: node.label,
                ref: {
                    index: node.ref.index,
                    uuid: node.ref.uuid,
                },
                name: node.name,
                color: node.color,
                shape: node.shape,
                x: diagEl.attributes.position.x,
                y: diagEl.attributes.position.y,
            };
        });

        // Define lambda for mapping relations
        const relationMapFn = (param: [number | string, Relation]) => {
            const [id, relation] = param;
            return {
                ...relation,
                vertices: this.getLinkById(id)?.vertices(),
            };
        };

        // Map normal and visual relations to an array
        const relations: Relation[] = Array.from(this.relations, relationMapFn);
        relations.push(...Array.from(this.visualRelations, relationMapFn));

        // Compose the serializable graph and return the JSON string
        return JSON.stringify({
            nodes,
            relations,
        });
    }

    /**
     * Get cell from the graph by id
     * @param id uuid of the cell
     */
    public getCellById(id: string | number): dia.Element {
        return this.graph.graph.getCell(id) as dia.Element;
    }

    /**
     * Get link from graph by id
     * @param id The id of the link
     */
    public getLinkById(id: string | number): dia.Link {
        return this.graph.graph.getCell(id) as dia.Link;
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
