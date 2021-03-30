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
    public static copy(diagram: Diagram): Diagram {
        return new Diagram(diagram.name, diagram.id);
    }
}
