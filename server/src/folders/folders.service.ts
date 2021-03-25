import { Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import { EntityNotValidException } from "../util/exceptions/EntityNotValidException";
import { Diagram } from "../diagrams/diagram.model";
import { Folder } from "./folder.model";
import { Transaction } from "neo4j-driver";
import Result from "neo4j-driver/types/result";

@Injectable()
export class FoldersService {
    constructor(private readonly neo4jService: Neo4jService) {}

    /**
     * @private Configures the default database
     */
    private readonly database = process.env.DB_TOOL;

    /**
     * Return all folders at top level (which are not nested into another folder)
     */
    async getAllRootFolders(): Promise<Folder[]> {
        // language=Cypher
        const cypher = "MATCH (f:Folder) WHERE NOT (f)-[:IS_CHILD]->() RETURN f AS folder";
        const params = {};

        return this.neo4jService
            .read(cypher, params, this.database)
            .then((res) => res.records.map(FoldersService.parseFolder));
    }

    /**
     * Return a specific folder by id
     *
     * @param id
     */
    async getFolder(id: number): Promise<Folder> {
        // Check whether id belongs to a folder
        if (!(await this.isFolder(id))) throw new NotAcceptableException("Id does not belong to a folder");

        // language=Cypher
        const cypher = "MATCH (f:Folder) WHERE id(f) = $id RETURN f AS folder";
        const param = {
            id: this.neo4jService.int(id),
        };

        return this.neo4jService.read(cypher, param, this.database).then((res) => {
            if (!res.records.length) {
                throw new NotFoundException(`Element with id: ${id} not found`);
            }
            return FoldersService.parseFolder(res.records[0]);
        });
    }

    /**
     * Add a new folder
     *
     * @param name
     */
    async addFolder(name: string): Promise<Folder> {
        // language=Cypher
        const cypher = "CREATE (f:Folder {name: $name}) RETURN f AS folder";
        const params = {
            name,
        };

        return this.neo4jService
            .write(cypher, params, this.database)
            .then((res) => FoldersService.parseFolder(res.records[0]));
    }

    /**
     * Delete an existing folder
     * @param id
     */
    async deleteFolder(id: number): Promise<Folder> {
        // Check whether id belongs to a folder
        if (!(await this.isFolder(id))) throw new NotAcceptableException("Id does not belong to a folder");

        // language=Cypher
        const cypher = "MATCH (f:Folder) WHERE id(f) = $id DETACH DELETE f RETURN f AS folder";
        const params = {
            id: this.neo4jService.int(id),
        };

        return this.neo4jService.write(cypher, params, this.database).then((res) => {
            if (!res.records.length) {
                throw new NotFoundException(`Element with id: ${id} not found`);
            }
            return FoldersService.parseFolder(res.records[0]);
        });
    }

    /**
     * Update an existing folder
     *
     * @param id
     * @param name
     */
    async updateFolder(id: number, name: string): Promise<Folder> {
        // Check whether id belongs to a folder
        if (!(await this.isFolder(id))) throw new NotAcceptableException("Id does not belong to a folder");

        // language=Cypher
        const cypher = "MATCH (f:Folder) WHERE id(f) = $id SET name = $name RETURN f AS folder";
        const params = {
            id: this.neo4jService.int(id),
            name,
        };

        return this.neo4jService.write(cypher, params, this.database).then((res) => {
            if (!res.records.length) {
                throw new NotFoundException(`Element with id: ${id} not found`);
            }
            return FoldersService.parseFolder(res.records[0]);
        });
    }

    /**
     * Returns als folders and diagrams which are assign to the folder as a IS_CHILD relation
     *
     * @param id
     */
    async getChildrenOfFolder(id: number): Promise<Array<Folder | Diagram>> {
        // Check whether id belongs to a folder
        if (!(await this.isFolder(id))) throw new NotAcceptableException("Id does not belong to a folder");

        // language=Cypher
        const cypher = "MATCH (n)-[r:IS_CHILD]->(f:Folder) WHERE id(f) = $id RETURN n AS child";
        const params = {
            id: this.neo4jService.int(id),
        };

        return this.neo4jService.read(cypher, params, this.database).then((res) => {
            return res.records.map(FoldersService.parseFolderOrDiagram);
        });
    }

    /**
     * Returns a specific child of a given folder
     *
     * @param parentId
     * @param childId
     */
    async getChildOfFolder(parentId: number, childId: number): Promise<Folder | Diagram> {
        // Check whether id belongs to a folder
        if (!(await this.isFolder(parentId))) throw new NotAcceptableException("Id does not belong to a folder");

        // language=Cypher
        const cypher = "MATCH (n)-[r:IS_CHILD]->(f:Folder) WHERE id(f) = $parentId AND id(n) = $childId RETURN n";
        const params = {
            parentId: this.neo4jService.int(parentId),
            childId: this.neo4jService.int(childId),
        };
        return this.neo4jService.read(cypher, params, this.database).then((res) => {
            if (!res.records.length) {
                throw new NotFoundException(`Element with id: ${childId} not found`);
            }
            return FoldersService.parseFolderOrDiagram(res.records[0]);
        });
    }

    /**
     * Creates a IS_CHILD relation child-IS_CHILD->parent
     *
     * @param parentId
     * @param childId
     */
    async addChildToFolder(parentId: number, childId: number) {
        await this.validateParentAndChildById(parentId, childId);

        // Start a new transaction to keep deletion of old relationship and adding the new one persistent
        const transaction = this.neo4jService.beginTransaction(this.database);

        // Delete old IS_CHILD relation if available
        await this.deleteIsChildRelation(childId, transaction);

        //language=Cypher
        const cypher =
            "MATCH (p: Folder), (c) WHERE id(p) = $parentId AND id(c) = $childId " +
            "CREATE (c)-[r:IS_CHILD]->(p) RETURN c AS n";
        const params = {
            parentId: this.neo4jService.int(parentId),
            childId: this.neo4jService.int(childId),
        };
        const child = await this.neo4jService
            .write(cypher, params, transaction)
            .then((res) => FoldersService.parseFolderOrDiagram(res.records[0]));

        // Commit the transaction
        await transaction.commit();

        // Return child as promise
        return new Promise<Folder | Diagram>((resolve) => resolve(child));
    }

    /**
     * Deletes the IS_CHILD relation between the given parent and child
     *
     * @param parentId
     * @param childId
     */
    async removeChildFromFolder(parentId: number, childId: number) {
        // Check whether id belongs to a folder
        if (!(await this.isFolder(parentId))) throw new NotAcceptableException("Id does not belong to a folder");

        return this.deleteIsChildRelation(childId, this.database).then((res) =>
            FoldersService.parseFolderOrDiagram(res.records[0]),
        );
    }

    /**
     * Checks whether the element with the given id is an entity of type Folder
     *
     * @param id
     * @private
     */
    private async isFolder(id: number): Promise<boolean> {
        // language=Cypher
        const cypher = "MATCH (f) WHERE id(f) = $id RETURN labels(f) AS label";
        const params = {
            id: this.neo4jService.int(id),
        };

        return this.neo4jService.read(cypher, params, this.database).then((res) => {
            return res.records[0]?.get("label").indexOf("Folder") > -1;
        });
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
    private deleteIsChildRelation(childId: number, databaseOrTransaction?: string | Transaction): Result {
        //language=Cypher
        const cypher = "MATCH (c)-[r:IS_CHILD]->() WHERE id(c) = $childId DELETE r RETURN c AS n";
        const params = {
            childId: this.neo4jService.int(childId),
        };
        return this.neo4jService.write(cypher, params, databaseOrTransaction);
    }

    /**
     * Validates whether the given child is allowed to be related to the given parent
     *
     * @param parentId
     * @param childId
     * @private
     */
    private validateParentAndChildById(parentId: number, childId: number) {
        // language=Cypher
        const cypher = "MATCH (n) WHERE id(n) = $parentId OR id(n) = $childId RETURN n";
        const params = {
            parentId: this.neo4jService.int(parentId),
            childId: this.neo4jService.int(childId),
        };

        return this.neo4jService.read(cypher, params, this.database).then((res) => {
            try {
                return res.records.map((res) => FoldersService.parseValidationRecord(res, parentId, childId));
            } catch (e: unknown) {
                if (e instanceof EntityNotValidException) {
                    throw new NotAcceptableException("Must be: Folder -> Folder|Diagram");
                } else {
                    throw new InternalServerErrorException();
                }
            }
        });
    }

    /**
     * Restructure the response of the db
     *
     * @param record
     * @private
     */
    private static parseFolder(record: Record<any, any>): Folder {
        return {
            ...record.get("folder").properties,
            id: record.get("folder").identity.toNumber(),
        } as Folder;
    }

    /**
     * Parse the record if it could be either a diagram or a folder
     * Currently both the same, but already individually adjustable
     *
     * @param record
     * @private
     */
    private static parseFolderOrDiagram(record: Record<any, any>): Folder | Diagram {
        if (record.get("n").labels.indexOf("Folder") > -1) {
            // Parse folder
            return {
                ...record.get("n").properties,
                id: record.get("n").identity.toNumber(),
            } as Folder;
        } else {
            // Parse diagram
            return {
                ...record.get("n").properties,
                id: record.get("n").identity.toNumber(),
            } as Diagram;
        }
    }

    /**
     * Validate if a child of relation between parentId and childId is allowed
     *
     * @param record
     * @param parentId
     * @param childId
     * @private
     */
    private static parseValidationRecord(
        record: Record<any, any>,
        parentId: number,
        childId: number,
    ): Folder | Diagram {
        // Parent must be a folder
        if (record.get("n").identity.toNumber() == parentId && record.get("n").labels.indexOf("Folder") > -1) {
            return this.parseFolderOrDiagram(record);
        } else if (
            record.get("n").identity.toNumber() == childId &&
            (record.get("n").labels.indexOf("Folder") > -1 || record.get("n").labels.indexOf("Diagram") > -1)
        ) {
            // Child could be either a folder or a diagram
            return this.parseFolderOrDiagram(record);
        }

        // Throw exception if relation is not allowed for the both entities
        throw new EntityNotValidException();
    }
}
