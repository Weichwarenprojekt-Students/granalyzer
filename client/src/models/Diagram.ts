export class Diagram {
    /**
     * GraphData Model
     *
     * @param name Name of the specific diagram
     * @param id Identifier
     * @param serialized Graph json
     */
    constructor(public name: string, public id: number = 0, public serialized = "") {}

    /**
     * Copy a diagram
     */
    public static copy(diagram: Diagram): Diagram {
        return new Diagram(diagram.name, diagram.id);
    }
}
