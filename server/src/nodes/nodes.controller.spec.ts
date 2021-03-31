import { Test, TestingModule } from "@nestjs/testing";
import { NodesController } from "./nodes.controller";
import { Neo4jModule, Neo4jService } from "nest-neo4j/dist";
import { NodesService } from "./nodes.service";
import Node from "./node.model";
import * as dotenv from "dotenv";
import { Label } from "../data-scheme/models/label";
import { NumberAttribute, StringAttribute } from "../data-scheme/models/attributes";
import { UtilModule } from "../util/util.module";
import { InternalServerErrorException } from "@nestjs/common";

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
                UtilModule.forRoot(),
            ],
            controllers: [NodesController],
            providers: [NodesService],
        }).compile();

        controller = module.get<NodesController>(NodesController);
        service = module.get<NodesService>(NodesService);
        neo4jService = module.get<Neo4jService>(Neo4jService);

        // language=cypher
        await neo4jService.write(`CREATE DATABASE ${process.env.DB_TOOL} IF NOT exists`).catch(console.error);
        // language=cypher
        await neo4jService.write(`CREATE DATABASE ${process.env.DB_CUSTOMER} IF NOT exists`).catch(console.error);

        // language=cypher
        const cypher = "MATCH (n) DETACH DELETE n RETURN n";

        await neo4jService.write(cypher, {}, process.env.DB_TOOL);
        await neo4jService.write(cypher, {}, process.env.DB_CUSTOMER);
    });

    beforeEach(async () => {
        function writeLabel(l): Promise<number> {
            // language=cypher
            const cypher = `
              MERGE (l:LabelScheme {name: $labelName})
              SET l.color = $color, l.attributes = $attribs
              RETURN l AS label`;

            const params = {
                labelName: l.name,
                color: l.color,
                attribs: JSON.stringify(l.attributes),
            };
            return neo4jService
                .write(cypher, params, process.env.DB_TOOL)
                .then((res) => res.records[0].get("label").identity.toNumber());
        }

        function writeNode(node: Node): Promise<number> {
            // language=cypher
            const cypher = `
              MERGE (m:${node.label} {name: $name})
              SET m.attrOne = $attrOne, m.attrTwo = $attrTwo
              RETURN m AS ${node.label}`;

            const params = {
                name: node.name,
                label: node.label,
                attrOne: node.attributes.attrOne,
                attrTwo: node.attributes.attrTwo,
            };
            return neo4jService
                .write(cypher, params, process.env.DB_CUSTOMER)
                .then((res) => res.records[0].get(node.label).identity.toNumber());
        }

        const movieLabel = new Label("Movie", "#EEE", [
            new NumberAttribute("attrOne", true, 1900),
            new StringAttribute("attrTwo", false, "empty"),
        ]);
        movieLabel.id = await writeLabel(movieLabel);

        const threePropsLabel = new Label("ThreeProps", "#333", [
            new NumberAttribute("attrOne", true, 1900),
            new StringAttribute("attrTwo", true, "empty"),
            new StringAttribute("attrThree", true, "empty"),
        ]);
        threePropsLabel.id = await writeLabel(threePropsLabel);

        const rightParseLabel = new Label("rightParse", "#222", [
            new NumberAttribute("attrOne", true, 1900),
            new StringAttribute("attrTwo", true, "empty"),
        ]);
        rightParseLabel.id = await writeLabel(rightParseLabel);

        const movieNode = new Node("Avengers", "Movie", { attrOne: 1990, attrTwo: "GER" });
        movieNode.id = await writeNode(movieNode);

        const missingAttributeNode = new Node("MissingNode", "ThreeProps", { attrOne: 1234, attrTwo: "Alfons" });
        missingAttributeNode.id = await writeNode(missingAttributeNode);

        const rightParseNode = new Node("ParseNode", "rightParse", { attrOne: 1234, attrTwo: "HansPeter" });
        rightParseNode.id = await writeNode(rightParseNode);
    });

    afterEach(async () => {
        // language=cypher
        const cypher = "MATCH (n) DETACH DELETE n RETURN n";

        await neo4jService.write(cypher, {}, process.env.DB_TOOL);
        await neo4jService.write(cypher, {}, process.env.DB_CUSTOMER);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
        expect(service).toBeDefined();
        expect(neo4jService).toBeDefined();
    });

    describe("get one node", () => {
        it("should get one node", async () => {
            expect((await controller.getNode("Avengers")).name).toBe("Avengers");
        });

        it("should throw an exception", async () => {
            await expect(controller.getNode("MissingNode")).rejects.toThrowError(InternalServerErrorException);
        });

        it("should return the attribute the right datatypes", async () => {
            const resultNode = await controller.getNode("ParseNode");

            expect(typeof resultNode.attributes.attrOne).toBe("number");
            expect(typeof resultNode.attributes.attrTwo).toBe("string");
        });
    });
});
