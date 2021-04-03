export interface ICommand {
    /**
     * The undo action
     */
    Undo(): void;

    /**
     * The redo action
     */
    Redo(): void;
}
