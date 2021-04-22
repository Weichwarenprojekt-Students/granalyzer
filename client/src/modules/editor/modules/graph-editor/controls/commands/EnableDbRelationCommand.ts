import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { Relation, RelationModeType } from "@/modules/editor/modules/graph-editor/controls/models/Relation";

export class EnableDbRelationCommand implements ICommand {
    /**
     * Constructor
     *
     * @param graphHandler The graph handler instance
     * @param relation The relation object
     */
    constructor(private graphHandler: GraphHandler, private relation: Relation) {}

    /**
     * The redo action which enables a db relation
     */
    redo(): void {
        if (this.graphHandler.relationMode.active) {
            // During active relation mode just switch the color
            this.graphHandler.relations.switchToNormal(this.relation);
        } else {
            this.graphHandler.relations.addExisting(this.relation, RelationModeType.NORMAL);
        }
    }

    /**
     * The undo action which disables a db relation
     */
    undo(): void {
        this.graphHandler.relations.removeExisting(this.relation);
    }
}
