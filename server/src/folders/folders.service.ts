import { Injectable, NotFoundException } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";

@Injectable()
export class FoldersService {
    constructor(private readonly neo4jService: Neo4jService) {}

    /**
     * @private Configures the default database
     */
    private readonly database = process.env.DB_TOOL;

    /**
     * Return all folders
     */
    async getFolders() {
        // language=Cypher
        const cypher = "MATCH (f:Folder) RETURN f AS folder";
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
    async getFolder(id: number) {
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
    async addFolder(name: string) {
        // language=Cypher
        const cypher = "";
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
    async deleteFolder(id: number) {
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
    async updateFolder(id: number, name: string) {
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
     * Restructure the response of the db
     *
     * @param record
     * @private
     */
    private static parseFolder(record: Record<any, any>) {
        return {
            ...record.get("folder").properties,
            id: record.get("folder").identity.toNumber(),
        };
    }
}
