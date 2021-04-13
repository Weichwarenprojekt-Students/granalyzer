import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { Neo4jModule } from "nest-neo4j/dist";
import { DiagramsModule } from "./diagrams/diagrams.module";
import { DataSchemeModule } from "./data-scheme/data-scheme.module";
import { FoldersModule } from "./folders/folders.module";
import { NodesModule } from "./nodes/nodes.module";
import { UtilModule } from "./util/util.module";
import { DatabaseUtil } from "./util/database.util";
import { RelationsModule } from "./relations/relations.module";

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
        RelationsModule,
        UtilModule.forRoot(),
    ],
})
export class AppModule {
    constructor(private databaseUtil: DatabaseUtil) {
        databaseUtil.initDatabase().then(() => console.log("Database setup successful"));
    }
}
