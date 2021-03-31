import { dia, shapes } from "jointjs";
import { Relation } from "./Relation";
import { Node } from "./Node";
import { NodeShapes } from "./NodeShapes";
import { SerializableGraph } from "@/modules/editor/modules/graph-editor/models/SerializableGraph";

export class GraphHandler {
    /**
     * The nodes/elements of the diagram
     */
    private nodes = new Map<dia.Element, Node>();

    /**
     * The relations between the nodes of the diagram
     */
    private relations = new Map<shapes.standard.Link, Relation>();

    /**
     * The actual graph object from joint
     */
    private readonly graph: dia.Graph;

    /**
     * Constructor
     * @param graph The graph object from joint
     */
    constructor(graph: dia.Graph) {
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
            const newNode = this.addNode(node);
            const ref = this.nodes.get(newNode);
            if (ref) mappedNodes.set(`${ref.ref.uuid}-${ref.ref.index}`, newNode);
        });

        // Create the relations
        relations.forEach((relation) => {
            const source = mappedNodes.get(`${relation.from.uuid}-${relation.from.index}`);
            const target = mappedNodes.get(`${relation.to.uuid}-${relation.to.index}`);
            if (source && target) this.addRelation(source, target, relation.uuid, relation.label);
        });
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
     * Add a diagram element/node
     *
     * @graph node The node values
     */
    public addNode(node: Node): dia.Element {
        // Check if a node of this type was already registered and update the ref
        let index = -1;
        this.nodes.forEach((value) => {
            if (node.ref.uuid == value.ref.uuid) index = Math.max(index, value.ref.index);
        });
        if (index >= 0) node.ref.index = index + 1;

        // Create the shape
        const shape = NodeShapes.parseType(node.shape);
        shape.position(node.x, node.y);
        shape.resize(100, 60);
        shape.attr({
            body: {
                fill: node.color ? node.color : "#70FF87",
                strokeWidth: 0,
                rx: 4,
                ry: 4,
                class: "node",
            },
            label: {
                text: node.label,
            },
        });

        // Add the shape to the graph and to the other nodes
        this.nodes.set(shape, node);
        if (this.graph) shape.addTo(this.graph);
        return shape;
    }

    /**
     * Remove the diagram element
     *
     * @param diagElement The element to be removed
     */
    public removeNode(diagElement: dia.Element): void {
        // Remove all relations to/from this node
        const nodeRef = this.nodes.get(diagElement);
        if (!nodeRef) return;
        this.relations.forEach((value, key) => {
            if (value.from == nodeRef.ref || value.to == nodeRef.ref) this.relations.delete(key);
        });

        // Remove the node
        this.nodes.delete(diagElement);

        // Remove the element from the diagram and re-render
        const diagElements = this.graph.getElements();
        const elIndex = diagElements.indexOf(diagElement);
        if (elIndex !== -1) {
            diagElements[elIndex].remove();
        }
    }

    /**
     * Add a new relation
     *
     * @param source The source element
     * @param target The target element
     * @param uuid An optional uuid for the relation
     * @param label An optional label for the label
     */
    public addRelation(source: dia.Element, target: dia.Element, uuid?: string, label?: string): void {
        // Check if the nodes exist
        const from = this.nodes.get(source);
        const to = this.nodes.get(target);
        if (!from || !to) return;

        // Create the node relation
        const relation: Relation = {
            uuid,
            label,
            from: from.ref,
            to: to.ref,
        };

        // Create the link
        const link = new shapes.standard.Link();
        link.source(source);
        link.target(target);
        link.attr({
            line: {
                strokeWidth: 4,
            },
        });
        link.router("manhattan");
        link.connector("rounded");

        // Add the relation to the graph and to the other links
        link.addTo(this.graph);
        this.relations.set(link, relation);
    }

    /**
     * Remove a relation
     * @param relation The relation to be removed
     * @graph graph The graph object
     */
    public removeRelation(relation: shapes.standard.Link): void {
        // Remove the relation
        this.relations.delete(relation);

        // Remove the relation from the diagram and re-render
        const diagRelations = this.graph.getLinks();
        const relIndex = diagRelations.indexOf(relation);
        if (relIndex !== -1) {
            diagRelations[relIndex].remove();
        }
    }

    /**
     * Draws the graph
     */
    public drawGraph(): void {
        this.nodes.forEach((ref, diagElement) => {
            diagElement.addTo(this.graph);
        });

        this.relations.forEach((relation, link) => {
            link.addTo(this.graph);
        });
    }
}
