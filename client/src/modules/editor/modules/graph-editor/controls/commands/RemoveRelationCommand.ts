import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { Relation, RelationModeType } from "@/modules/editor/modules/graph-editor/controls/models/Relation";

/**
 * Command to remove a relation
 */
export class RemoveRelationCommand implements ICommand {
    /**
     * Constructor
     *
     * @param graphHandler The graph handler instance
     * @param relation The relation to remove
     */
    constructor(private graphHandler: GraphHandler, private relation: Relation) {}

    /**
     * The redo action which adds a relation
     */
    redo(): void {
        this.graphHandler.relations.removeExisting(this.relation);
    }

    /**
     * The undo action which removes a relation
     */
    undo(): void {
        this.graphHandler.relations.addExisting(this.relation, RelationModeType.NORMAL);
    }
}
