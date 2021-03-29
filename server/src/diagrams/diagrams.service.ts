import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import * as neo4j from "neo4j-driver";
import { Diagram } from "./diagram.model";
import { UtilsNode } from "../util/utils.node";
import { FoldersService } from "../folders/folders.service";
import { Transaction } from "neo4j-driver";
import Result from "neo4j-driver/types/result";

@Injectable()
export class DiagramsService {
    constructor(
        private readonly neo4jService: Neo4jService,
        private readonly utilsNode: UtilsNode,
        @Inject(forwardRef(() => FoldersService)) private foldersService: FoldersService,
    ) {}

    /**
     * @private Configures the default database
     */
    private readonly database = process.env.DB_TOOL;

    /**
     * Fetches all diagrams from the db
     */
    async getDiagrams(): Promise<Diagram[]> {
        // language=Cypher
        const cypher =
            "MATCH (d:Diagram) OPTIONAL MATCH (d)-[:IS_CHILD]->(f:Folder) RETURN d AS diagram, id(f) AS parentId";
        const params = {};

        return this.neo4jService
            .read(cypher, params, this.database)
            .then((res) => res.records.map(DiagramsService.parseDiagram));
    }

    /**
     * Return all diagrams at top level (which are not nested into another folder)
     */
    async getAllRootDiagrams(): Promise<Diagram[]> {
        // language=Cypher
        const cypher = "MATCH (d:Diagram) WHERE NOT (d)-[:IS_CHILD]->() RETURN d AS diagram";
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
        const cypher =
            "MATCH (d:Diagram) WHERE id(d) = $id OPTIONAL MATCH (d)-[:IS_CHILD]->(f:Folder) RETURN d AS diagram, id(f) AS parentId";
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
        const cypher =
            "MATCH (d:Diagram) WHERE id(d) = $id SET d = {name: $name} OPTIONAL MATCH (d)-[:IS_CHILD]->(f:Folder) RETURN d AS diagram, id(f) AS parentId";
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
        const cypher =
            "MATCH (d:Diagram) WHERE id(d) = $id OPTIONAL MATCH (d)-[:IS_CHILD]->(f:Folder) DETACH DELETE d RETURN d AS diagram, id(f) AS folder";
        const params = {
            id: neo4j.int(id),
        };

        return this.neo4jService.write(cypher, params, this.database).then((res) => {
            return DiagramsService.parseDiagram(res.records[0]);
        });
    }

    /**
     * Returns all diagrams which are assign to the folder as a IS_CHILD relation
     *
     * @param id
     */
    async getDiagramsInFolder(id: number): Promise<Diagram[]> {
        // Check whether id belongs to a folder
        await this.utilsNode.checkElementForLabel(id, "Folder");

        // language=Cypher
        const cypher =
            "MATCH (c:Diagram)-[r:IS_CHILD]->(p:Folder) WHERE id(p) = $id RETURN c AS diagram, $id AS parentId";
        const params = {
            id: this.neo4jService.int(id),
        };

        return this.neo4jService.read(cypher, params, this.database).then((res) => {
            return res.records.map(DiagramsService.parseDiagram);
        });
    }

    /**
     * Returns a specific child of a given folder
     *
     * @param parentId
     * @param childId
     */
    async getDiagramInFolder(parentId: number, childId: number): Promise<Diagram> {
        // Check whether id belongs to a folder
        await this.utilsNode.checkElementForLabel(parentId, "Folder");
        await this.utilsNode.checkElementForLabel(childId, "Diagram");

        // language=Cypher
        const cypher =
            "MATCH (d:Diagram)-[r:IS_CHILD]->(f:Folder) WHERE id(f) = $parentId AND id(d) = $childId RETURN d AS diagram, id(f) AS parentId";
        const params = {
            parentId: this.neo4jService.int(parentId),
            childId: this.neo4jService.int(childId),
        };
        return this.neo4jService.read(cypher, params, this.database).then((res) => {
            return DiagramsService.parseDiagram(res.records[0]);
        });
    }

    /**
     * Creates a IS_CHILD relation child-IS_CHILD->parent
     *
     * @param parentId
     * @param childId
     */
    async moveDiagramToFolder(parentId: number, childId: number): Promise<Diagram> {
        // Check whether id and child id belongs to a folder
        await this.utilsNode.checkElementForLabel(parentId, "Folder");
        await this.utilsNode.checkElementForLabel(childId, "Diagram");

        // Start a new transaction to keep deletion of old relationship and adding the new one persistent
        const transaction = this.neo4jService.beginTransaction(this.database);

        // Delete old IS_CHILD relation if available
        await this.deleteIsChildRelation(childId, transaction);

        //language=Cypher
        const cypher =
            "MATCH (p:Folder), (c:Diagram) WHERE id(p) = $parentId AND id(c) = $childId " +
            "CREATE (c)-[r:IS_CHILD]->(p) RETURN c AS diagram, id(p) AS parentId";
        const params = {
            parentId: this.neo4jService.int(parentId),
            childId: this.neo4jService.int(childId),
        };
        const child = await this.neo4jService
            .write(cypher, params, transaction)
            .then((res) => DiagramsService.parseDiagram(res.records[0]));

        // Commit the transaction
        await transaction.commit();

        // Return child as promise
        return new Promise<Diagram>((resolve) => resolve(child));
    }

    /**
     * Deletes the IS_CHILD relation between the given parent and child
     *
     * @param parentId
     * @param childId
     */
    async removeDiagramFromFolder(parentId: number, childId: number): Promise<Diagram> {
        // Check whether id belongs to a folder
        await this.utilsNode.checkElementForLabel(parentId, "Folder");
        await this.utilsNode.checkElementForLabel(childId, "Diagram");

        return this.deleteIsChildRelation(childId, this.database).then((res) =>
            DiagramsService.parseDiagram(res.records[0]),
        );
    }

    /**
     * Deletes all outgoing IS_CHILD relations of node with childId
     *
     * To provide a folder structure a child must be assigned to only one parent!
     *
     * @param childId Id of the node whose relations should be deleted
     * @param databaseOrTransaction The current database or a neo4j transaction
     * @private
     */
    deleteIsChildRelation(childId: number, databaseOrTransaction?: string | Transaction): Result {
        //language=Cypher
        const cypher =
            "MATCH (c:Diagram)-[r:IS_CHILD]->(f:Folder) WHERE id(c) = $childId DELETE r RETURN c AS diagram, id(f) AS parentId";
        const params = {
            childId: this.neo4jService.int(childId),
        };
        return this.neo4jService.write(cypher, params, databaseOrTransaction);
    }

    /**
     * Restructure the response of the db
     *
     * @param record
     * @private
     */
    static parseDiagram(record: Record<any, any>): Diagram {
        const diagram: Diagram = {
            ...record.get("diagram").properties,
            id: record.get("diagram").identity.toNumber(),
        };

        // Append parentId if available
        if (record.keys.indexOf("parentId") > -1) {
            diagram.parentId = record.get("parentId")?.toNumber();
        }

        return diagram;
    }
}
