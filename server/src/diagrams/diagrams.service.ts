import { Injectable } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import * as neo4j from "neo4j-driver";
import { Diagram } from "./diagram.model";
import { UtilsNode } from "../util/utils.node";

@Injectable()
export class DiagramsService {
    constructor(private readonly neo4jService: Neo4jService, private readonly utilsNode: UtilsNode) {}

    /**
     * @private Configures the default database
     */
    private readonly database = process.env.DB_TOOL;

    /**
     * Fetches all diagrams from the db
     */
    async getDiagrams(): Promise<Diagram[]> {
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
    async getDiagram(id: number): Promise<Diagram> {
        // Check whether id belongs to a diagram
        await this.utilsNode.checkElementForLabel(id, "Diagram");

        // language=Cypher
        const cypher = "MATCH (d:Diagram) WHERE id(d) = $id RETURN d AS diagram";
        const params = {
            id: neo4j.int(id),
        };

        return this.neo4jService.read(cypher, params, this.database).then((res) => {
            return DiagramsService.parseDiagram(res.records[0]);
        });
    }

    /**
     * Adds a new diagram to the db
     *
     * @param name
     */
    async addDiagram(name: string): Promise<Diagram> {
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
    async updateDiagram(id: number, name: string): Promise<Diagram> {
        // Check whether id belongs to a diagram
        await this.utilsNode.checkElementForLabel(id, "Diagram");

        // language=Cypher
        const cypher = "MATCH (d:Diagram) WHERE id(d) = $id SET d = {name: $name} RETURN d AS diagram";
        const params = {
            id: neo4j.int(id),
            name,
        };
        return this.neo4jService.write(cypher, params, this.database).then((res) => {
            return DiagramsService.parseDiagram(res.records[0]);
        });
    }

    /**
     * Delete specific diagram
     *
     * @param id Identifier
     */
    async deleteDiagram(id: number): Promise<Diagram> {
        // Check whether id belongs to a diagram
        await this.utilsNode.checkElementForLabel(id, "Diagram");

        // language=Cypher
        const cypher = "MATCH (d:Diagram) WHERE ID(d) = $id DETACH DELETE d RETURN d AS diagram";
        const params = {
            id: neo4j.int(id),
        };

        return this.neo4jService.write(cypher, params, this.database).then((res) => {
            return DiagramsService.parseDiagram(res.records[0]);
        });
    }

    /**
     * Restructure the response of the db
     *
     * @param record
     * @private
     */
    private static parseDiagram(record: Record<any, any>): Diagram {
        return {
            ...record.get("diagram").properties,
            id: record.get("diagram").identity.toNumber(),
        } as Diagram;
    }
}
