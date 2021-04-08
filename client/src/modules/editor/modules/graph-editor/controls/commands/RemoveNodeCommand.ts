import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";
import { dia } from "jointjs";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { Node } from "@/modules/editor/modules/graph-editor/controls/models/Node";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/models/Relation";
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
    constructor(private graphHandler: GraphHandler, private readonly diagElement: dia.Element) {
        // Create deep copy of the given node and exit if node is not set
        const node = graphHandler.nodes.get(diagElement);
        if (!node) return;
        this.node = deepCopy(node);

        // Create deep copy of all relations
        this.graphHandler.relations.forEach((value) => {
            if (value.from == node.ref || value.to == node.ref) this.relations.push(deepCopy(value));
        });
    }

    /**
     * The redo action
     */
    redo(): void {
        this.graphHandler.controls.removeNode(this.diagElement);
    }

    /**
     * The undo action
     */
    undo(): void {
        // Restore the deleted diagram element from node copy
        if (!this.node) return;
        this.graphHandler.controls.addExistingNode(this.node, this.diagElement);

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
                this.graphHandler.controls.addRelation(sourceElement, targetElement, relation.uuid, relation.type);
        });
    }
}
