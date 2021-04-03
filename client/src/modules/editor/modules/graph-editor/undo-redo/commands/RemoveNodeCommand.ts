import { ICommand } from "@/modules/editor/modules/graph-editor/undo-redo/commands/ICommand";
import { dia } from "jointjs";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/GraphHandler";
import { Node } from "@/modules/editor/modules/graph-editor/models/Node";
import { GraphActions } from "@/modules/editor/modules/graph-editor/undo-redo/GraphActions";
import { Relation } from "@/modules/editor/modules/graph-editor/models/Relation";
import { deepCopy } from "@/utility";

export class RemoveNodeCommand implements ICommand {
    /**
     * The node that should be removed
     */
    private readonly node?: Node;

    /**
     * The relations that affect this node
     */
    private relations = new Array<Relation>();

    /**
     * Constructor
     *
     * @param graphHandler The GraphHandler instance
     * @param diagElement The diagram element
     */
    constructor(private graphHandler: GraphHandler, private diagElement: dia.Element) {
        // Create deep copy of the given node
        const node = graphHandler.nodes.get(diagElement);
        if (node) this.node = deepCopy(node);
        else return;

        // Create deep copy of all relations
        this.graphHandler.relations.forEach((value, key) => {
            if (value.from == node.ref || value.to == node.ref) {
                const relation = this.graphHandler.relations.get(key);
                if (relation) this.relations.push(deepCopy(relation));
            }
        });
    }

    /**
     * The redo action
     */
    redo(): void {
        GraphActions.removeNode(this.diagElement, this.graphHandler);
    }

    /**
     * The undo action
     */
    undo(): void {
        // Restore the deleted diagram element from node copy
        if (this.node) this.diagElement = GraphActions.addNode(this.node, this.graphHandler);
        else return;

        // Restore the deleted relations from the relations copy
        this.relations.forEach((relation) => {
            let sourceElement = {} as dia.Element;
            let targetElement = {} as dia.Element;

            // Find diagram elements which are connected to restored diagram element
            this.graphHandler.nodes.forEach((value, key) => {
                if (relation.from.uuid == value.ref.uuid && relation.from.index == value.ref.index) sourceElement = key;
                if (relation.to.uuid == value.ref.uuid && relation.to.index == value.ref.index) targetElement = key;
            });
            if (sourceElement && targetElement)
                GraphActions.addRelation(
                    this.graphHandler,
                    sourceElement,
                    targetElement,
                    relation.uuid,
                    relation.label,
                );
        });
    }
}
