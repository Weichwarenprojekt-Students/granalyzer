import { ICommand } from "@/modules/editor/modules/graph-editor/UndoRedo/Commands/ICommand";
import { dia } from "jointjs";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/GraphHandler";
import { Node } from "@/modules/editor/modules/graph-editor/models/Node";
import { GraphActions } from "@/modules/editor/modules/graph-editor/UndoRedo/GraphActions";
import { Relation } from "@/modules/editor/modules/graph-editor/models/Relation";

export class RemoveNodeCommand implements ICommand {
    private readonly node: Node;
    private relations = new Array<Relation>();

    /**
     * Constructor
     * @param gH The GrahpHandler instance
     * @param diagElement The diagram element
     */
    constructor(private gH: GraphHandler, private diagElement: dia.Element) {
        // Create deep copy of node
        this.node = this.deepCopy(gH.nodes.get(diagElement));

        const nodeRef = gH.nodes.get(diagElement);
        if (!nodeRef) return;

        // Create deep copy of all relations
        this.gH.relations.forEach((value, key) => {
            // Find relations from/to this node
            if (value.from == nodeRef.ref || value.to == nodeRef.ref) {
                this.relations.push(this.deepCopy(this.gH.relations.get(key)));
            }
        });
    }

    /**
     * The redo action
     */
    Redo(): void {
        // Remove the node and all its relations (in diagram and in data)
        GraphActions.removeNode(this.diagElement, this.gH);
    }

    /**
     * The undo action
     */
    Undo(): void {
        // Restore the deleted diagram element from node copy
        this.diagElement = GraphActions.addNode(this.node, this.gH);

        // Restore the deleted relations from the relations copy
        this.relations.forEach((relation) => {
            let sourceElement = {} as dia.Element;
            let targetElement = {} as dia.Element;

            // Find diagram elements which are connected to restored diagram element
            this.gH.nodes.forEach((value, key) => {
                if (relation.from.uuid == value.ref.uuid && relation.from.index == value.ref.index) sourceElement = key;
                if (relation.to.uuid == value.ref.uuid && relation.to.index == value.ref.index) targetElement = key;
            });

            if (sourceElement && targetElement)
                GraphActions.addRelation(this.gH, sourceElement, targetElement, relation.uuid, relation.label);
        });
    }

    /**
     * Creates a deep-copy of any object
     * @param obj The object to be copied
     */
    private deepCopy(obj: any): any {
        return JSON.parse(JSON.stringify(obj));
    }
}
