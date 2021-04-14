import { dia, g } from "jointjs";
import { Relation } from "./models/Relation";
import { Node } from "./models/Node";
import { SerializableGraph } from "@/modules/editor/modules/graph-editor/controls/models/SerializableGraph";
import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";
import { JointGraph } from "@/shared/JointGraph";
import { Store } from "vuex";
import { RootState } from "@/store";
import { GraphControls } from "@/modules/editor/modules/graph-editor/controls/GraphControls";

export class GraphHandler {
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
    }

    /**
     * Create the diagram from the JSON string
     *
     * @param jsonString The diagram json value
     */
    public fromJSON(jsonString: string): void {
        if (!jsonString) return;

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

    /**
     * Takes care of overlapping relations
     * From: https://resources.jointjs.com/tutorial/multiple-links-between-elements
     *
     * @param element Node of the jointjs diagram
     * @param rearrangeAll Ff false the rearrangement does not apply on links which were already positioned
     */
    public adjustSiblingRelations(element: dia.Element, rearrangeAll = true): void {
        // Get the first link from the element
        const firstConnectedLink = this.graph.graph.getConnectedLinks(element)[0];

        // Exit if node has no relation
        if (!firstConnectedLink) return;

        const link = firstConnectedLink;

        // Get the start and end node id of the relation
        const startId = link.get("source").id || link.previous("source").id;
        const endId = link.get("target").id || link.previous("target").id;

        // Exit if not both endpoints of the relation are set
        if (!startId || !endId) return;

        // identify link siblings
        const siblings = this.graph.graph.getLinks().filter((sibling) => {
            const siblingStartId = sibling.source().id;
            const siblingEndId = sibling.target().id;

            // if source and target are the same
            // or if source and target are reversed
            return (
                (siblingStartId === startId && siblingEndId === endId) ||
                (siblingStartId === endId && siblingEndId === startId)
            );
        });

        // Get the amount of
        const numSiblings = siblings.length;

        // Prevent overlapping if more than one relation
        if (numSiblings > 1) {
            // Get the middle point of the link
            const sourceCenter = this.graph.graph.getCell(startId).getBBox().center();
            const targetCenter = this.graph.graph.getCell(endId).getBBox().center();
            const midPoint = new g.Line(sourceCenter, targetCenter).midpoint();

            // Get the angle between start and end node
            const theta = sourceCenter.theta(targetCenter);

            // The maximum distance between two sibling links
            const GAP = 120;
            let i = 0;
            siblings.forEach((sibling) => {
                // Ignore already moved relations if flag is false
                if (!rearrangeAll && sibling.vertices().length !== 0) return;

                // Contains calculated vertices
                let vertex = new g.Point(0, 0);

                let atCorrectPosition = false;
                while (!atCorrectPosition) {

                    // Offset values like 0, 20, 20, 40, 40, 60, 60 ...
                    let offset = GAP * Math.ceil(i / 2);

                    // Alternate the direction in which the relation is moved (right/left)
                    const sign = i % 2 ? 1 : -1;

                    // Keep even numbers of relations symmetric
                    if (numSiblings % 2 === 0) {
                        offset -= (GAP / 2) * sign;
                    }

                    // Make reverse links count the same as non-reverse
                    const reverse = theta < 180 ? 1 : -1;

                    // Apply the shifted relation
                    const angle = g.toRad(theta + sign * reverse * 90);
                    vertex = g.Point.fromPolar(offset, angle, midPoint);

                    atCorrectPosition = true;
                    i++;

                    // Check if there is a relation at the same position
                    siblings.map((s) => s.vertices()).filter((v) => v.length != 0).forEach((v) => {
                        if (vertex.distance(new g.Point(v[0])) < 10) {
                            atCorrectPosition = false;
                        }
                    });
                }

                // Replace vertices
                if (vertex) sibling.vertices([vertex]);
            });
        }
    }
}
