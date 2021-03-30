import { Test, TestingModule } from "@nestjs/testing";
import { NodesController } from "./nodes.controller";
import { Neo4jModule, Neo4jService } from "nest-neo4j/dist";
import { UtilsNode } from "../util/utils.node";
import { NodesService } from "./nodes.service";
import * as dotenv from "dotenv";

describe("NodesController", () => {
    let module: TestingModule;

    let service: NodesService;
    let neo4jService: Neo4jService;
    let controller: NodesController;

    beforeAll(async () => {
        // Get .env variables
        dotenv.config();

        module = await Test.createTestingModule({
            imports: [
                Neo4jModule.forRoot({
                    scheme: "bolt",
                    host: process.env.DB_HOST,
                    port: process.env.DB_PORT,
                    username: process.env.DB_USERNAME,
                    password: process.env.DB_PASSWORD,
                }),
            ],
            controllers: [NodesController],
            providers: [NodesService, UtilsNode],
        }).compile();

        controller = module.get<NodesController>(NodesController);
        service = module.get<NodesService>(NodesService);
        neo4jService = module.get<Neo4jService>(Neo4jService);

        // language=cypher
        await neo4jService.write(`CREATE DATABASE ${process.env.DB_TOOL} IF NOT exists`).catch(console.error);
        // language=cypher
        await neo4jService.write(`CREATE DATABASE ${process.env.DB_CUSTOMER} IF NOT exists`).catch(console.error);

        // language=cypher
        await neo4jService.write("MATCH (a) DETACH DELETE a RETURN a", {}, process.env.DB_TOOL);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
        expect(service).toBeDefined();
        expect(neo4jService).toBeDefined();
    });

    describe("get all nodes", () => {
        it("should get two nodes", async () => {
            expect((await controller.getAllNodes(2, 0)).length).toEqual(2);
        });

        it("should get the second node", async () => {
            //expect(await controller.getAllNodes(1, 1)).toStrictEqual(secondNode);
        });
    });
});
