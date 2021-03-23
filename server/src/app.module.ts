import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { Neo4jModule, Neo4jService } from "nest-neo4j/dist";

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
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
    constructor(private neo4jService: Neo4jService) {
        this.initDatabase();
    }

    /**
     * On startup check if the necessary tool and customer DB exists and create them if not
     */
    initDatabase() {
        this.neo4jService.write("CREATE DATABASE tool IF NOT EXISTS").catch(console.error);
        this.neo4jService.write("CREATE DATABASE customer IF NOT EXISTS").catch(console.error);
    }
}
