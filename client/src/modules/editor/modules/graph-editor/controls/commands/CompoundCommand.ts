import { ICommand } from "@/modules/editor/modules/graph-editor/controls/models/ICommand";

export class CompoundCommand implements ICommand {
    /**
     * Constructor
     *
     * @param commands The commands to execute at the same time, from first to last executed
     */
    constructor(private readonly commands: Array<ICommand>) {}

    /**
     * Redo all commands
     */
    redo(): void {
        this.commands.forEach((cmd) => cmd.redo());
    }

    /**
     * Undo all commands in reverse order
     */
    undo(): void {
        this.commands.reverse().forEach((cmd) => cmd.undo());
    }
}
