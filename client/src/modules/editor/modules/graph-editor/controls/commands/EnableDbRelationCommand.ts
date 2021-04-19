import { dia } from "jointjs";
import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";
import { GraphHandler } from "@/modules/editor/modules/graph-editor/controls/GraphHandler";
import { Relation } from "../models/Relation";

export class EnableDbRelationCommand implements ICommand {
    /**
     * Constructor
     *
     * @param graphHandler The graph handler instance
     * @param link The link as dia.Element to be enabled as DB Relation
     * @param relation The relation object for the corresponding link in the graph
     */
    constructor(private graphHandler: GraphHandler, private link: dia.Link, private relation: Relation) {}

    /**
     * The redo action which enables a db relation
     */
    redo(): void {
        if (this.graphHandler.relationMode.active) {
            this.graphHandler.relationMode.switchDbRelation(this.link.id);
        } else {
            this.graphHandler.controls.addExistingRelation(this.link, this.relation);
        }
    }

    /**
     * The undo action which disables a db relation
     */
    undo(): void {
        this.graphHandler.controls.removeRelation(this.link);
    }
}
