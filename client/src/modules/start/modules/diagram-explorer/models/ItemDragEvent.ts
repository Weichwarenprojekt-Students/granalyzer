export class ItemDragEvent {
    /**
     * The drag event for explorer items
     *
     * @param currentDragItem The id of the dragged item
     * @param newParent The id of the folder the item was dropped on
     */
    constructor(public currentDragItem: number, public newParent?: number) {}
}
