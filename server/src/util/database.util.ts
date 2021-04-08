import { Neo4jService } from "nest-neo4j/dist";
import { HttpException, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";

@Injectable()
export class DatabaseUtil {
    constructor(private readonly neo4jService: Neo4jService) {}

    /**
     * Catch neo4j query errors, log and hide them with an InternalServerError
     * @param err
     * @private
     */
    catchDbError(err: Error) {
        // Pass Nestjs HttpException forward
        if (err instanceof HttpException) throw err;

        // Logging instance with class context
        const logger = new Logger(DatabaseUtil.name);

        // Catch neo4j errors
        logger.error(err.message, err.stack);
        throw new InternalServerErrorException();

        // Necessary to avoid void return value of function
        return null;
    }

    /**
     * Creates the databases and the necessary constraints
     */
    async initDatabase() {
        // language=cypher
        await this.neo4jService.write(`CREATE DATABASE ${process.env.DB_TOOL} IF NOT exists`).catch(this.catchDbError);
        // language=cypher
        await this.neo4jService
            .write(`CREATE DATABASE ${process.env.DB_CUSTOMER} IF NOT exists`)
            .catch(this.catchDbError);

        const setupFolderKey = `
            CREATE CONSTRAINT FolderKey IF NOT EXISTS
            ON (f:Folder) 
            ASSERT (f.folderId) IS NODE KEY
        `;
        await this.neo4jService.write(setupFolderKey, {}, process.env.DB_TOOL).catch(this.catchDbError);

        const setupDiagramKey = `
            CREATE CONSTRAINT DiagramKey IF NOT EXISTS
            ON (d:Diagram)
            ASSERT (d.diagramId) IS NODE KEY
            `;
        await this.neo4jService.write(setupDiagramKey, {}, process.env.DB_TOOL).catch(this.catchDbError);

        const setupRelationTypeKey = `
            CREATE CONSTRAINT RelationTypeKey IF NOT EXISTS
            ON (rt:RelationType)
            ASSERT (rt.name) IS NODE KEY
            `;
        await this.neo4jService.write(setupRelationTypeKey, {}, process.env.DB_TOOL).catch(this.catchDbError);

        const setupLabelSchemeKey = `
            CREATE CONSTRAINT LabelSchemeKey IF NOT EXISTS
            ON (ls:LabelScheme)
            ASSERT (ls.name) IS NODE KEY
            `;
        await this.neo4jService.write(setupLabelSchemeKey, {}, process.env.DB_TOOL).catch(this.catchDbError);
    }

    /**
     * Clears both databases to have a clean base for test data mocks
     */
    async clearDatabase() {
        // language=cypher
        const cypher = "MATCH (a) DETACH DELETE a RETURN a";
        const params = {};

        await this.neo4jService.write(cypher, params, process.env.DB_TOOL);
        await this.neo4jService.write(cypher, params, process.env.DB_CUSTOMER);
    }
}
