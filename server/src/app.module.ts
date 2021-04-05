import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Neo4jModule, Neo4jService } from "nest-neo4j/dist";
import { DiagramsModule } from "./diagrams/diagrams.module";
import { DataSchemeModule } from "./data-scheme/data-scheme.module";
import { FoldersModule } from "./folders/folders.module";
import { NodesModule } from "./nodes/nodes.module";
import { UtilModule } from "./util/util.module";

@Module({
    imports: [
        ConfigModule.forRoot(),
        Neo4jModule.forRoot({
            scheme: "bolt",
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
        }),
        DiagramsModule,
        DataSchemeModule,
        FoldersModule,
        NodesModule,
        UtilModule.forRoot(),
    ],
})
export class AppModule {
    constructor(private neo4jService: Neo4jService) {
        this.initDatabase().then((ret) => console.log("Database setup successful"));
    }

    /**
     * On startup check if the necessary tool and customer DB exists and create them if not
     * Furthermore create the folder and diagram node keys
     */
    async initDatabase() {
        const params = { dbCustomer: process.env.DB_CUSTOMER, dbTool: process.env.DB_TOOL };
        await this.neo4jService.write("CREATE DATABASE $dbTool IF NOT EXISTS", params).catch(console.error);
        await this.neo4jService.write("CREATE DATABASE $dbCustomer IF NOT EXISTS", params).catch(console.error);

        const setupFolderKey = `
            CREATE CONSTRAINT FolderKey IF NOT EXISTS
            ON (f:Folder) 
            ASSERT (f.folderId) IS NODE KEY
        `;
        const setupDiagramKey = `
            CREATE CONSTRAINT DiagramKey IF NOT EXISTS
            ON (d:Diagram)
            ASSERT (d.diagramId) IS NODE KEY
            `;
        await this.neo4jService.write(setupFolderKey, {}, process.env.DB_TOOL);
        await this.neo4jService.write(setupDiagramKey, {}, process.env.DB_TOOL);
    }
}
