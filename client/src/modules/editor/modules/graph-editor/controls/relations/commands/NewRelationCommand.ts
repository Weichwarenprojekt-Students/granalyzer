import { ICommand } from "@/modules/editor/modules/graph-editor/controls/models/ICommand";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/relations/Relation";
import { Node } from "@/modules/editor/modules/graph-editor/controls/nodes/Node";
import { RelationModeType } from "@/modules/editor/modules/graph-editor/controls/relations/models/RelationModeType";

/**
 * Command for adding a new relation to the graph
 */
export class NewRelationCommand implements ICommand {
    /**
     * The relation object of the added relation for a second redo
     * @private
     */
    private relation?: Relation;

    /**
     * Constructor
     *
     * @param graphHandler The graph handler instance
     * @param source The source node of the relation
     * @param target The target node of the relation
     * @param relationModeType The relation mode type of the relation
     * @param labelText The text to display as the label of the relation
     * @param uuid The backend uuid of the relation
     */
    constructor(
        private graphHandler: GraphHandler,
        private source: Node,
        private target: Node,
        private relationModeType = RelationModeType.NORMAL,
        private labelText?: string,
        private uuid?: string,
    ) {}

    /**
     * The redo action which adds a relation
     */
    redo(): void {
        if (this.relation == null)
            // The first execution of the command, the relation object isn't defined, so add a new relation to the graph
            this.relation = this.graphHandler.relations.new(
                this.source,
                this.target,
                this.relationModeType,
                this.labelText,
                this.uuid,
            );
        // After the first execution, the existing relation can just be added
        else this.graphHandler.relations.addExisting(this.relation, RelationModeType.NORMAL);
    }

    /**
     * The undo action which removes a relation
     */
    undo(): void {
        if (this.relation != null) this.graphHandler.relations.removeExisting(this.relation);
    }

    /**
     * Set the text for the label
     *
     * @param labelText The text
     */
    public setLabelText(labelText: string): void {
        this.labelText = labelText;
    }
}
