import { Node } from "@/modules/editor/modules/graph-editor/controls/nodes/Node";
import { ICommand } from "@/modules/editor/modules/graph-editor/controls/commands/ICommand";
import { Relation } from "@/modules/editor/modules/graph-editor/controls/relations/Relation";
import { NodeInfo } from "@/modules/editor/modules/graph-editor/controls/nodes/models/NodeInfo";
import { RelationInfo } from "@/modules/editor/modules/graph-editor/controls/relations/models/RelationInfo";
import { deepCopy } from "@/utility";

export class RestyleCommand implements ICommand {
    /**
     * The old style of the element
     */
    private readonly oldStyle: NodeInfo | RelationInfo;

    /**
     * The new style of the element
     */
    private newStyle?: NodeInfo | RelationInfo;

    /**
     * Constructor
     *
     * @param element The element reference
     */
    constructor(private readonly element: Node | Relation) {
        this.oldStyle = deepCopy(this.element.info);
    }

    /**
     * Set the new style of the element
     *
     * @param newStyle The new element info
     */
    public setNewStyle(newStyle: NodeInfo | RelationInfo): void {
        this.newStyle = newStyle;
    }

    /**
     * Set the new shape
     */
    redo(): void {
        if (this.element.isNode()) this.element.updateStyle(this.newStyle as NodeInfo, true);
        else this.element.updateStyle(this.newStyle as RelationInfo, true);
    }

    /**
     * Set the old shape
     */
    undo(): void {
        if (this.element.isNode()) this.element.updateStyle(this.oldStyle as NodeInfo, true);
        else this.element.updateStyle(this.oldStyle as RelationInfo, true);
    }
}
