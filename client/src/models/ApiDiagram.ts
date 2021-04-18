export class ApiDiagram {
    /**
     * GraphData Model
     *
     * @param name Name of the specific diagram
     * @param diagramId Identifier
     * @param serialized Serialized diagram
     */
    constructor(public name: string, public diagramId: string = "", public serialized = "{}") {}
}
