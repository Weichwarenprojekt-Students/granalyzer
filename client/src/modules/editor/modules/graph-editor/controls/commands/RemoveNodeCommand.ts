import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { Node } from "@/modules/editor/modules/graph-editor/controls/models/Node";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/models/Relation";
import { RelationModeType } from "@/modules/editor/modules/graph-editor/controls/models/RelationModeType";

export class RemoveNodeCommand implements ICommand {
    /**
     * The relations that affect this node
     */
    private relations = new Array<Relation>();

    /**
     * Constructor
     *
     * @param graphHandler The GraphHandler instance
     * @param node The node to remove
     */
    constructor(private graphHandler: GraphHandler, private readonly node: Node) {
        // Save all incoming and outgoing relations
        this.relations.push(...node.incomingRelations.values());
        this.relations.push(...node.outgoingRelations.values());
    }

    /**
     * The redo action which removes the node
     */
    redo(): void {
        this.graphHandler.nodes.removeExisting(this.node);
    }

    /**
     * The undo action which adds the node and all its relations
     */
    undo(): void {
        this.graphHandler.nodes.addExisting(this.node);

        // Restore the deleted relations from the relations copy
        this.relations.forEach((relation) => {
            this.graphHandler.relations.addExisting(relation, RelationModeType.NORMAL);
        });
    }
}
