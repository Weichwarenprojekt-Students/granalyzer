import { Injectable, NotFoundException } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import { Folder } from "./folder.model";
import { Transaction } from "neo4j-driver";
import Result from "neo4j-driver/types/result";
import { NodeUtil } from "../util/node.util";

@Injectable()
export class FoldersService {
    /**
     * Configures the default database
     */
    private readonly database = process.env.DB_TOOL;

    constructor(private readonly neo4jService: Neo4jService, private readonly nodeUtil: NodeUtil) {}

    /**
     * Return all folders
     */
    async getAllFolders(): Promise<Folder[] | undefined> {
        // language=Cypher
        const cypher = `
          MATCH (f:Folder)
          OPTIONAL MATCH (f)-[:IS_CHILD]->(p:Folder)
          RETURN f {. *, parentId:p.folderId} AS folder
        `;

        const params = {};

        // Callback function which is applied on the neo4j response
        const resolveRead = (res) => res.records.map((rec) => rec.get("folder"));

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.nodeUtil.catchDbError);
    }

    /**
     * Return all folders at top level (which are not nested into another folder)
     */
    async getAllRootFolders(): Promise<Folder[] | undefined> {
        // language=Cypher
        const cypher = `
          MATCH (f:Folder)
            WHERE NOT (f)-[:IS_CHILD]->()
          RETURN f {. *} AS folder
        `;

        const params = {};

        // Callback function which is applied on the neo4j response
        const resolveRead = (res) => res.records.map((rec) => rec.get("folder"));

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.nodeUtil.catchDbError);
    }

    /**
     * Return a specific folder by id
     */
    async getFolder(id: string): Promise<Folder> {
        // language=Cypher
        const cypher = `
          MATCH (f:Folder)
            WHERE f.folderId = $id
          OPTIONAL MATCH (f)-[:IS_CHILD]->(p:Folder)
          RETURN f {. *, parentId:p.folderId} AS folder
        `;

        const param = {
            id,
        };

        // Callback function which is applied on the neo4j response
        const resolveRead = (res) => {
            // Check if the folder exists
            if (!res.records[0]) {
                throw new NotFoundException(`Folder with id ${id} not found.`);
            }
            return res.records[0].get("folder");
        };

        return this.neo4jService
            .read(cypher, param, this.database)
            .then(resolveRead)
            .catch(this.nodeUtil.catchDbError);
    }

    /**
     * Add a new folder
     */
    async addFolder(name: string): Promise<Folder> {
        // language=Cypher
        const cypher = `
          CREATE (f:Folder {name: $name, folderId: apoc.create.uuid()})
          RETURN f {. *} AS folder
        `;

        const params = {
            name,
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => res.records[0].get("folder");

        return this.neo4jService
            .write(cypher, params, this.database)
            .then(resolveWrite)
            .catch(this.nodeUtil.catchDbError);
    }

    /**
     * Delete an existing folder
     */
    async deleteFolder(id: string): Promise<Folder> {
        // Deletes the folder and all contained children (recursively)
        // language=Cypher
        const cypher = `
          MATCH (f:Folder), (c)
            WHERE f.folderId = $id AND (c:Diagram OR c:Folder)
          MATCH (c)-[:IS_CHILD*0..]->(f)
          OPTIONAL MATCH (f)-[:IS_CHILD]->(p:Folder)
          WITH c, p.folderId AS parentId, properties(f) AS props
          DETACH DELETE c
          RETURN props {. *, parentId:parentId} AS folder
        `;

        const params = {
            id,
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            // Check if the element which should be deleted did exist
            if (!res.records[0]) {
                throw new NotFoundException(`Folder with id ${id} not found.`);
            }
            return res.records[0].get("folder");
        };

        return this.neo4jService
            .write(cypher, params, this.database)
            .then(resolveWrite)
            .catch(this.nodeUtil.catchDbError);
    }

    /**
     * Update an existing folder
     */
    async updateFolder(id: string, name: string): Promise<Folder> {
        // language=Cypher
        const cypher = `
          MATCH (f:Folder)
            WHERE f.folderId = $id
          OPTIONAL MATCH (f)-[:IS_CHILD]->(p:Folder)
          SET f.name = $name
          RETURN f {. *, parentId:p.folderId} AS folder
        `;

        const params = {
            id,
            name,
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            // Check if the element which should be updated did exist
            if (!res.records[0]) {
                throw new NotFoundException(`Folder with id ${id} not found.`);
            }
            return res.records[0].get("folder");
        };

        return this.neo4jService
            .write(cypher, params, this.database)
            .then(resolveWrite)
            .catch(this.nodeUtil.catchDbError);
    }

    /**
     * Returns all folders which are assigned to the folder as IS_CHILD relation
     */
    async getFoldersInFolder(id: string): Promise<Folder[] | undefined> {
        // language=Cypher
        const cypher = `
          MATCH (c:Folder)-[:IS_CHILD]->(p:Folder)
            WHERE p.folderId = $id
          RETURN c {. *, parentId:p.folderId} AS folder
        `;

        const params = {
            id,
        };

        // Callback function which is applied on the neo4j response
        const resolveRead = (res) => res.records.map((rec) => rec.get("folder"));

        // Will return empty array if folder with id does not exist
        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.nodeUtil.catchDbError);
    }

    /**
     * Returns a specific child of a given folder
     */
    async getFolderInFolder(parentId: string, childId: string): Promise<Folder> {
        // language=Cypher
        const cypher = `
          MATCH (c:Folder)-[:IS_CHILD]->(p:Folder)
            WHERE c.folderId = $childId AND p.folderId = $parentId
          RETURN c {. *, parentId:p.folderId} AS folder
        `;

        const params = {
            parentId,
            childId,
        };

        // Callback function which is applied on the neo4j response
        const resolveRead = (res) => {
            // Catch child or parent not found
            if (!res.records[0]) {
                throw new NotFoundException("Child or parent element not found.");
            }
            return res.records[0].get("folder");
        };

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.nodeUtil.catchDbError);
    }

    /**
     * Creates a IS_CHILD relation child-IS_CHILD->parent
     */
    async moveFolderToFolder(parentId: string, childId: string): Promise<Folder> {
        // Start a new transaction to keep deletion of old relationship and adding the new one persistent
        const transaction = this.neo4jService.beginTransaction(this.database);

        // Delete old IS_CHILD relation if available
        await this.deleteIsChildRelation(childId, transaction);

        //language=Cypher
        const cypher = `
          MATCH (p:Folder), (c:Folder)
            WHERE c.folderId = $childId AND p.folderId = $parentId
          MERGE (c)-[r:IS_CHILD]->(p)
          RETURN c {. *, parentId:p.folderId} AS folder
        `;

        const params = {
            parentId,
            childId,
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            // Check if elements were found
            if (!res.records[0]) {
                throw new NotFoundException("Child or parent element has not been found.");
            }
            return res.records[0].get("folder");
        };

        const child = await this.neo4jService
            .write(cypher, params, transaction)
            .then(resolveWrite)
            .catch(this.nodeUtil.catchDbError);

        // Commit the transaction
        await transaction.commit();

        // Return child as promise
        return new Promise<Folder>((resolve) => resolve(child));
    }

    /**
     * Adds a new folder inside of the folder with the given parent id
     */
    async addFolderInFolder(parentId: string, childName: string): Promise<Folder> {
        const folder = await this.addFolder(childName);

        return this.moveFolderToFolder(parentId, folder["folderId"]);
    }

    /**
     * Deletes the IS_CHILD relation between the given parent and child
     */
    async removeFolderFromFolder(parentId: string, childId: string): Promise<Folder> {
        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            // Check if elements were found
            if (!res.records[0]) {
                throw new NotFoundException("Child or parent element has not been found.");
            }
            return res.records[0].get("folder");
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
    deleteIsChildRelation(childId: string, databaseOrTransaction?: string | Transaction): Result {
        //language=Cypher
        const cypher = `
          MATCH (c:Folder)-[r:IS_CHILD]->(p:Folder)
            WHERE c.folderId = $childId
          DELETE r
          RETURN c {. *, parentId:p.folderId} AS folder
        `;

        const params = {
            childId,
        };

        return this.neo4jService.write(cypher, params, databaseOrTransaction);
    }
}
