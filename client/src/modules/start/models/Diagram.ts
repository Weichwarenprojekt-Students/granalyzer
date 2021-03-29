export class Diagram {
    /**
     * Diagram Model
     *
     * @param name Name of the specific diagram
     * @param id Identifier
     */
    constructor(public name: string, public id: number = 0) {}

    /**
     * Copy a diagram
     */
    public copy(): Diagram {
        return new Diagram(this.name, this.id);
    }
}
