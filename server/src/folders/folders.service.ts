import { Injectable, NotFoundException } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import { Folder } from "./folder.model";
import { Transaction } from "neo4j-driver";
import Result from "neo4j-driver/types/result";

@Injectable()
export class FoldersService {
    /**
     * Configures the default database
     */
    private readonly database = process.env.DB_TOOL;

    constructor(private readonly neo4jService: Neo4jService) {}

    /**
     * Return all folders
     */
    async getAllFolders(): Promise<Folder[]> {
        // language=Cypher
        const cypher = `
          MATCH (f:Folder)
          OPTIONAL MATCH (f:Folder)-[:IS_CHILD]->(p:Folder)
          RETURN f {. *, parentId:p.folderId} AS folders
        `;

        const params = {};

        return this.neo4jService
            .read(cypher, params, this.database)
            .then((res) => res.records.map((rec) => rec.get("folders")));
    }

    /**
     * Return all folders at top level (which are not nested into another folder)
     */
    async getAllRootFolders(): Promise<Folder[]> {
        // language=Cypher
        const cypher = `
          MATCH (f:Folder)
            WHERE NOT (f)-[:IS_CHILD]->()
          RETURN f { .* } AS folders
        `;

        const params = {};

        return this.neo4jService
            .read(cypher, params, this.database)
            .then((res) => res.records.map((rec) => rec.get("folders")));
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

        return this.neo4jService.read(cypher, param, this.database).then((res) => res.records[0].get("folder"));
    }

    /**
     * Add a new folder
     */
    async addFolder(name: string): Promise<Folder> {
        // language=Cypher
        const cypher = `
          CREATE (f:Folder {name: $name, folderId: apoc.create.uuid()})
          RETURN f { .* } AS folder
        `;

        const params = {
            name,
        };

        return this.neo4jService.write(cypher, params, this.database).then((res) => res.records[0].get("folder"));
    }

    /**
     * Delete an existing folder
     */
    async deleteFolder(id: string): Promise<Folder> {
        // Deletes the folder and all contained children (recursively)
        // language=Cypher
        const cypher = `
          MATCH (f:Folder)<-[:IS_CHILD*0..]-(c)
            WHERE f.folderId = $id
          OPTIONAL MATCH (f)-[:IS_CHILD]->(p:Folder)
          DETACH DELETE c
          RETURN f {. *, parentId: p.folderId } AS folder
        `;

        const params = {
            id,
        };

        return this.neo4jService.write(cypher, params, this.database).then((res) => res.records[0].get("folder"));
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

        return this.neo4jService.write(cypher, params, this.database).then((res) => res.records[0].get("folder"));
    }

    /**
     * Returns all folders which are assigned to the folder as IS_CHILD relation
     */
    async getFoldersInFolder(id: string): Promise<Folder[]> {
        // language=Cypher
        const cypher = `
          MATCH (c:Folder)-[:IS_CHILD]->(p:Folder)
            WHERE p.folderId = $id
          RETURN c {. *, parentId:p.folderId} AS folders
        `;

        const params = {
            id,
        };

        return this.neo4jService.read(cypher, params, this.database).then((res) => {
            return res.records.map((rec) => rec.get("folders"));
        });
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

        return this.neo4jService
            .read(cypher, params, this.database)
            .then((res) => res.records[0].get("folder"))
            .catch(() => {
                throw new NotFoundException("Child or parent element not found.");
            });
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
          RETURN c { .*, parentId: p.folderId } AS folder
        `;

        const params = {
            parentId,
            childId,
        };
        const child = await this.neo4jService
            .write(cypher, params, transaction)
            .then((res) => res.records[0].get("folder"))
            .catch(() => {
                throw new NotFoundException("Child or parent element has not been found.");
            });

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
        return this.deleteIsChildRelation(childId, this.database).then((res) => res.records[0].get("folder"));
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
          RETURN c {. *, parentId:p.folderId}
        `;

        const params = {
            childId,
        };

        return this.neo4jService.write(cypher, params, databaseOrTransaction);
    }
}
