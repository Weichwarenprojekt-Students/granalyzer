/**
 * @group db/data-scheme/controller
 */

import { Test, TestingModule } from "@nestjs/testing";
import { DataSchemeController } from "./data-scheme.controller";
import { DataSchemeService } from "./data-scheme.service";
import { Neo4jModule, Neo4jService } from "nest-neo4j/dist";
import { NotFoundException } from "@nestjs/common";
import { Label } from "./models/label";
import { ColorAttribute, NumberAttribute, StringAttribute } from "./models/attributes";
import { RelationType } from "./models/relationType";
import { Connection } from "./models/connection";

describe("DataSchemeController", () => {
    let module: TestingModule;

    let service: DataSchemeService;
    let neo4jService: Neo4jService;
    let controller: DataSchemeController;

    let movieLabelId: number;
    let personLabelId: number;
    let actedInRelationId: number;
    let followsRelationId: number;

    beforeAll(async () => {
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
            controllers: [DataSchemeController],
            providers: [DataSchemeService],
        }).compile();

        neo4jService = module.get<Neo4jService>(Neo4jService);
        service = module.get<DataSchemeService>(DataSchemeService);
        controller = module.get<DataSchemeController>(DataSchemeController);

        // language=cypher
        neo4jService.write(`CREATE DATABASE ${process.env.DB_TOOL} IF NOT exists`).catch(console.error);
        // language=cypher
        neo4jService.write(`CREATE DATABASE ${process.env.DB_CUSTOMER} IF NOT exists`).catch(console.error);

        // language=cypher
        neo4jService.write(
            `
              MATCH (a)
              DETACH DELETE a
              RETURN a`,
            {},
            process.env.DB_TOOL,
        );
    });

    beforeEach(async () => {
        function writeLabel(l): Promise<number> {
            // language=cypher
            return neo4jService
                .write(
                    `
                      MERGE (l:LabelScheme {name: $labelName})
                      SET l.color = $color, l.attributes = $attribs
                      RETURN l AS label`,
                    {
                        labelName: l.name,
                        color: l.color,
                        attribs: JSON.stringify(l.attributes),
                    },
                    process.env.DB_TOOL,
                )
                .then((res) => res.records[0].get("label").identity.toNumber());
        }

        function writeRelation(r): Promise<number> {
            // language=cypher
            return neo4jService
                .write(
                    `
                      MERGE (r:RelationType {name: $labelName})
                      SET r.attributes = $attribs, r.connections = $connects
                      RETURN r AS relation`,
                    {
                        labelName: r.name,
                        attribs: JSON.stringify(r.attributes),
                        connects: JSON.stringify(r.connections),
                    },
                    process.env.DB_TOOL,
                )
                .then((res) => res.records[0].get("relation").identity.toNumber());
        }

        const movieLabel = new Label("Movie", "#666", [
            new StringAttribute("title", true, "unknown"),
            new NumberAttribute("released"),
        ]);

        movieLabelId = await writeLabel(movieLabel);

        const personLabel = new Label("Person", "#420", [
            new StringAttribute("name", true, "Done Default"),
            new ColorAttribute("haircolor"),
        ]);

        personLabelId = await writeLabel(personLabel);

        const actedInRelation = new RelationType(
            "ACTED_IN",
            [new StringAttribute("role")],
            [new Connection("Person", "Movie")],
        );

        actedInRelationId = await writeRelation(actedInRelation);

        const followsRelation = new RelationType("FOLLOWS", [], [new Connection("Person", "Person")]);

        followsRelationId = await writeRelation(followsRelation);
    });

    afterEach(async () => {
        // language=cypher
        neo4jService.write(
            `
              MATCH (a)
              DETACH DELETE a
              RETURN a`,
            {},
            process.env.DB_TOOL,
        );
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
        expect(neo4jService).toBeDefined();
        expect(controller).toBeDefined();
    });

    // describe("getScheme", () => {
    //     it("should return the scheme", async () => {
    //         expect(await controller.getScheme()).toStrictEqual();
    //     });
    // });
    //
    // describe("getAllLabels", () => {
    //     it("should return all Labels", async () => {
    //         jest.spyOn(neo4jService, "read").mockImplementation(() => DataSchemeRepository.mockGetAllLabels());
    //
    //         expect(await controller.getAllLabels()).toStrictEqual(DataSchemeRepository.resultGetAllLabels());
    //     });
    // });

    describe("getLabel", () => {
        it("should return one label", async () => {
            expect(await controller.getLabel(movieLabelId)).toEqual({
                id: movieLabelId,
                name: "Movie",
                color: "#666",
                attributes: [
                    {
                        name: "title",
                        mandatory: true,
                        defaultValue: "unknown",
                    },
                    {
                        name: "released",
                    },
                ],
            });
        });

        it("should return not found exception", async () => {
            await expect(controller.getLabel(movieLabelId + personLabelId)).rejects.toThrowError(NotFoundException);
        });
    });

    // describe("getAllRelations", () => {
    //     it("should return all relations", async () => {
    //         jest.spyOn(neo4jService, "read").mockImplementation(() => DataSchemeRepository.mockGetAllRelations());
    //
    //         expect(await controller.getAllRelations()).toStrictEqual(DataSchemeRepository.resultGetAllRelations());
    //     });
    // });
    // describe("getRelation", () => {
    //     it("should return one relation", async () => {
    //         jest.spyOn(neo4jService, "read").mockImplementation(() => DataSchemeRepository.mockGetRelation());
    //
    //         expect(await controller.getRelation(0)).toStrictEqual(DataSchemeRepository.resultGetRelation());
    //     });
    //     it("should return not found exception", async () => {
    //         jest.spyOn(neo4jService, "read").mockImplementation(() => DataSchemeRepository.mockEmptyResponse());
    //
    //         await expect(controller.getRelation(10)).rejects.toThrowError(NotFoundException);
    //     });
    // });
});
