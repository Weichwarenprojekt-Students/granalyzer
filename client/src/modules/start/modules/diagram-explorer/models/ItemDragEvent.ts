/**
 * The drag event for explorer items
 */
export class ItemDragEvent {
    constructor(public currentDragItem: number, public newParent?: number) {}
}
