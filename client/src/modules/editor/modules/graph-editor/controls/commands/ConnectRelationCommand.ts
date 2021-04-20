import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";
import { GraphHandler } from "../GraphHandler";
import { dia } from "jointjs";
import { RelationModeControls } from "@/modules/editor/modules/graph-editor/controls/RelationModeControls";

type Connection = { source: string | number; target: string | number };

export class ConnectRelationCommand implements ICommand {
    // private readonly previousConnection: Connection;
    //
    // private newConnection?: Connection;

    /**
     * Constructor
     */
    constructor(private graphHandler: GraphHandler, private diagElement: dia.Link) {
        // const relation = this.graphHandler.visualRelations.get(diagElement.id);
        //
        // if (!relation) return;
        //
        // const [oldSourceId, oldTargetId] = RelationModeControls.getElementIdsFromRelation(graphHandler, relation);
        // this.previousConnection = { source: oldSourceId, target: oldTargetId };
        //
        // console.log("previous", this.previousConnection);
    }

    /**
     * Check if the vertices of the link have changed
     */
    // public connectionHasChanged(): boolean {
    //     this.newConnection = this.getCurrentConnection();
    //
    //     const p = this.previousConnection;
    //     const n = this.newConnection;
    //
    //     if (!p || !n) return false;
    //
    //     return !(p.source === n.source && p.target === n.target);
    // }

    redo(): void {
        // if (this.newConnection) this.setConnectionEndpoints(this.newConnection);
    }

    undo(): void {
        // if (this.previousConnection) this.setConnectionEndpoints(this.previousConnection);
    }

    // private setConnectionEndpoints(connection: Connection) {
    //     const source = this.graphHandler.getCellById(connection.source);
    //     const target = this.graphHandler.getCellById(connection.target);
    //
    //     if (source) this.diagElement.source(source);
    //     if (target) this.diagElement.target(target);
    // }
    //
    // private getCurrentConnection(): Connection | undefined {
    //     const source = this.diagElement.source();
    //     const target = this.diagElement.target();
    //
    //     if (!source.id || !target.id) return;
    //
    //     return {
    //         source: source.id,
    //         target: target.id,
    //     };
    // }
}
