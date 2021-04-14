export class Diagram {
    /**
     * Mock graph
     */
    // language=JSON
    public serialized = "";

    /**
     * GraphData Model
     *
     * @param name Name of the specific diagram
     * @param diagramId Identifier
     */
    constructor(public name: string, public diagramId: string = "") {}
}
