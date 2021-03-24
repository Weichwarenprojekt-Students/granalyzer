import { Injectable, NotFoundException } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import * as neo4j from "neo4j-driver";

@Injectable()
export class DiagramsService {
    constructor(private readonly neo4jService: Neo4jService) {}

    /**
     * @private Configures the default database
     */
    private readonly database = process.env.DB_TOOL;

    /**
     * Fetches all diagrams from the db
     */
    async getDiagrams() {
        // language=Cypher
        const cypher = "MATCH (d:Diagram) RETURN d AS diagram";
        const params = {};

        return this.neo4jService
            .read(cypher, params, this.database)
            .then((res) => res.records.map(DiagramsService.parseDiagram));
    }

    /**
     * Fetch a specific diagram from the db
     *
     * @param id Identifier of the diagram
     */
    async getDiagram(id: number) {
        // language=Cypher
        const cypher = "MATCH (d:Diagram) WHERE id(d) = $id RETURN d AS diagram";
        const params = {
            id: neo4j.int(id),
        };

        return this.neo4jService.read(cypher, params, this.database).then((res) => {
            if (!res.records.length) {
                throw new NotFoundException(`Element with id: ${id} not found`);
            }
            return DiagramsService.parseDiagram(res.records[0]);
        });
    }

    /**
     * Adds a new diagram to the db
     *
     * @param name
     */
    async addDiagram(name: string) {
        // language=Cypher
        const cypher = "CREATE (d:Diagram {name: $name}) RETURN d AS diagram";
        const params = {
            name,
        };
        return this.neo4jService
            .write(cypher, params, this.database)
            .then((res) => DiagramsService.parseDiagram(res.records[0]));
    }

    /**
     * Updates a specific diagram
     *
     * @param id Identifier of the diagram
     * @param name Name of the diagram
     */
    async updateDiagram(id: number, name: string) {
        // language=Cypher
        const cypher = "MATCH (d:Diagram) WHERE id(d) = $id SET d = {name: $name} RETURN d AS diagram";
        const params = {
            id: neo4j.int(id),
            name,
        };
        return this.neo4jService.write(cypher, params, this.database).then((res) => {
            if (!res.records.length) {
                throw new NotFoundException(`Element with id: ${id} not found`);
            }
            return DiagramsService.parseDiagram(res.records[0]);
        });
    }

    /**
     * Delete specific diagram
     *
     * @param id Identifier
     */
    deleteDiagram(id: number) {
        // language=Cypher
        const cypher = "MATCH (d:Diagram) WHERE ID(d) = $id DETACH DELETE d RETURN d AS diagram";
        const params = {
            id: neo4j.int(id),
        };

        return this.neo4jService.write(cypher, params, this.database).then((res) => {
            if (!res.records.length) {
                throw new NotFoundException(`Element with id: ${id} not found`);
            }
            return DiagramsService.parseDiagram(res.records[0]);
        });
    }

    /**
     * Restructure the response of the db
     *
     * @param record
     * @private
     */
    private static parseDiagram(record: Record<any, any>) {
        return {
            ...record.get("diagram").properties,
            id: record.get("diagram").identity.toNumber(),
        };
    }
}
