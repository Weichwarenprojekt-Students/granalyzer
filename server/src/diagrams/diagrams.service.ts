import { Injectable, NotFoundException } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import { Diagram } from "./diagram.model";
import { Transaction } from "neo4j-driver";
import Result from "neo4j-driver/types/result";
import { NodeUtil } from "../util/node.util";

@Injectable()
export class DiagramsService {
    /**
     * Configures the default database
     */
    private readonly database = process.env.DB_TOOL;

    constructor(private readonly neo4jService: Neo4jService, private readonly nodeUtil: NodeUtil) {}

    /**
     * Fetches all diagrams from the db
     */
    async getDiagrams(): Promise<Diagram[] | undefined> {
        // language=Cypher
        const cypher = `
          MATCH (d:Diagram)
          OPTIONAL MATCH (d)-[:IS_CHILD]->(f:Folder)
          RETURN d {. *, parentId:f.folderId} AS diagram
        `;

        const params = {};

        // Callback function which is applied on the neo4j response
        const resolveRead = (res) => res.records.map((rec) => rec.get("diagram"));

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.nodeUtil.catchDbError);
    }

    /**
     * Return all diagrams at top level (which are not nested into another folder)
     */
    async getAllRootDiagrams(): Promise<Diagram[] | undefined> {
        // language=Cypher
        const cypher = `
          MATCH (d:Diagram)
            WHERE NOT (d)-[:IS_CHILD]->()
          RETURN d {. *} AS diagram
        `;

        const params = {};

        // Callback function which is applied on the neo4j response
        const resolveRead = (res) => res.records.map((rec) => rec.get("diagram"));

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.nodeUtil.catchDbError);
    }

    /**
     * Fetch a specific diagram from the db
     */
    async getDiagram(id: string): Promise<Diagram> {
        // language=Cypher
        const cypher = `
          MATCH (d:Diagram {diagramId: $id})
          OPTIONAL MATCH (d)-[:IS_CHILD]->(f:Folder)
          RETURN d {. *, parentId:f.folderId} AS diagram
        `;

        const params = {
            id,
        };

        // Callback function which is applied on the neo4j response
        const resolveRead = (res) => {
            if (!res.records[0]) {
                throw new NotFoundException(`The diagram with id ${id} has not been found`);
            }
            return res.records[0].get("diagram");
        };

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.nodeUtil.catchDbError);
    }

    /**
     * Adds a new diagram to the db
     */
    async addDiagram(name: string, serialized = ""): Promise<Diagram> {
        // language=Cypher
        const cypher = `
          CREATE (d:Diagram {name: $name, serialized: $serialized, diagramId: apoc.create.uuid()})
          RETURN d {. *} AS diagram
        `;

        const params = {
            name,
            serialized,
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => res.records[0].get("diagram");

        return this.neo4jService
            .write(cypher, params, this.database)
            .then(resolveWrite)
            .catch(this.nodeUtil.catchDbError);
    }

    /**
     * Updates a specific diagram
     */
    async updateDiagram(id: string, name: string, serialized: string): Promise<Diagram> {
        // language=Cypher
        const cypher = `
          MATCH (d:Diagram {diagramId: $id})
          OPTIONAL MATCH (d)-[:IS_CHILD]->(f:Folder)
          SET d.name = $name, d.serialized = $serialized
          RETURN d {. *, parentId:f.folderId} AS diagram
        `;

        const params = {
            id,
            name,
            serialized,
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            if (!res.records[0]) {
                throw new NotFoundException(`The diagram with the id ${id} could not be found`);
            }
            return res.records[0].get("diagram");
        };

        return this.neo4jService
            .write(cypher, params, this.database)
            .then(resolveWrite)
            .catch(this.nodeUtil.catchDbError);
    }

    /**
     * Delete specific diagram
     */
    async deleteDiagram(id: string): Promise<Diagram> {
        // language=Cypher
        const cypher = `
          MATCH (d:Diagram)
            WHERE d.diagramId = $id
          OPTIONAL MATCH (d)-[:IS_CHILD]->(f:Folder)
          WITH properties(d) AS props, f, d
          DETACH DELETE d
          RETURN props {. *, parentId:f.parentId} AS diagram`;

        const params = {
            id,
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            if (!res.records[0]) {
                throw new NotFoundException(`The diagram with id ${id} has not been found`);
            }
            return res.records[0].get("diagram");
        };

        return this.neo4jService
            .write(cypher, params, this.database)
            .then(resolveWrite)
            .catch(this.nodeUtil.catchDbError);
    }

    /**
     * Returns all diagrams which are assigned to the folder as a IS_CHILD relation
     */
    async getDiagramsInFolder(id: string): Promise<Diagram[] | undefined> {
        // language=Cypher
        const cypher = `
          MATCH (c:Diagram)-[r:IS_CHILD]->(p:Folder)
            WHERE p.folderId = $id
          RETURN c {. *, parentId:p.folderId} AS diagram
        `;

        const params = {
            id,
        };

        // Callback function which is applied on the neo4j response
        const resolveRead = (res) => res.records.map((rec) => rec.get("diagram"));

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.nodeUtil.catchDbError);
    }

    /**
     * Returns a specific child of a given folder
     */
    async getDiagramInFolder(parentId: string, childId: string): Promise<Diagram> {
        // language=Cypher
        const cypher = `
          MATCH (d:Diagram)-[r:IS_CHILD]->(f:Folder)
            WHERE f.folderId = $parentId AND d.diagramId = $childId
          RETURN d {. *, parentId:f.folderId} AS diagram
        `;

        const params = {
            parentId,
            childId,
        };

        // Callback function which is applied on the neo4j response
        const resolveRead = (res) => {
            if (!res.records[0]) {
                throw new NotFoundException(`The folder or diagram has not been found`);
            }
            return res.records[0].get("diagram");
        };

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.nodeUtil.catchDbError);
    }

    /**
     * Creates a IS_CHILD relation child-IS_CHILD->parent
     */
    async moveDiagramToFolder(parentId: string, childId: string): Promise<Diagram> {
        // Start a new transaction to keep deletion of old relationship and adding the new one persistent
        const transaction = this.neo4jService.beginTransaction(this.database);

        // Delete old IS_CHILD relation if available
        await this.deleteIsChildRelation(childId, transaction);

        //language=Cypher
        const cypher = `
          MATCH (p:Folder), (c:Diagram)
            WHERE p.folderId = $parentId AND c.diagramId = $childId
          MERGE (c)-[r:IS_CHILD]->(p)
          RETURN c {. *, parentId:p.folderId} AS diagram
        `;

        const params = {
            parentId,
            childId,
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            if (!res.records[0]) {
                throw new NotFoundException(`The diagram could not be assigned to the new folder`);
            }
            return res.records[0].get("diagram");
        };

        // Fetch all child diagrams
        const child: Diagram = await this.neo4jService
            .write(cypher, params, transaction)
            .then(resolveWrite)
            .catch(this.nodeUtil.catchDbError);

        // Commit the transaction
        await transaction.commit();

        // Return child as promise
        return new Promise<Diagram>((resolve) => resolve(child));
    }

    /**
     * Deletes the IS_CHILD relation between the given parent and child
     */
    async removeDiagramFromFolder(parentId: string, childId: string): Promise<Diagram> {
        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            if (!res.records[0]) {
                throw new NotFoundException("Parent or child element could not be found");
            }
            return res.records[0].get("diagram");
        };

        return this.deleteIsChildRelation(childId, this.database).then(resolveWrite).catch(this.nodeUtil.catchDbError);
    }

    /**
     * Deletes all outgoing IS_CHILD relations of node with childId
     *
     * To provide a folder structure a child must be assigned to only one parent!
     *
     * @param childId Id of the node whose relations should be deleted
     * @param databaseOrTransaction The current database or a neo4j transaction
     */
    private deleteIsChildRelation(childId: string, databaseOrTransaction?: string | Transaction): Result {
        //language=Cypher
        const cypher = `
          MATCH (c:Diagram)-[r:IS_CHILD]->(f:Folder)
            WHERE c.diagramId = $childId
          DELETE r
          RETURN c {. *, parentId:f.folderId} AS diagram
        `;

        const params = {
            childId,
        };

        return this.neo4jService.write(cypher, params, databaseOrTransaction);
    }
}
