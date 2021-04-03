export interface ICommand {
    /**
     * The undo action
     */
    undo(): void;

    /**
     * The redo action
     */
    redo(): void;
}
