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
import { Scheme } from "./data-scheme.model";
import { ConfigModule } from "@nestjs/config";

describe("DataSchemeController", () => {
    let module: TestingModule;

    let service: DataSchemeService;
    let neo4jService: Neo4jService;
    let controller: DataSchemeController;

    let movieLabel: Label;
    let personLabel: Label;
    let actedInRelation: RelationType;
    let followsRelation: RelationType;

    let movieLabelId: string;
    let personLabelId: string;
    let actedInRelationId: string;
    let followsRelationId: string;

    beforeAll(async () => {
        module = await Test.createTestingModule({
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
            controllers: [DataSchemeController],
            providers: [DataSchemeService],
        }).compile();

        neo4jService = module.get<Neo4jService>(Neo4jService);
        service = module.get<DataSchemeService>(DataSchemeService);
        controller = module.get<DataSchemeController>(DataSchemeController);

        // language=cypher
        await neo4jService.write(`CREATE DATABASE ${process.env.DB_TOOL} IF NOT exists`).catch(console.error);
        // language=cypher
        await neo4jService.write(`CREATE DATABASE ${process.env.DB_CUSTOMER} IF NOT exists`).catch(console.error);

        // language=cypher
        await neo4jService.write("MATCH (a) DETACH DELETE a RETURN a", {}, process.env.DB_TOOL);
    });

    beforeEach(async () => {
        function writeLabel(l): Promise<string> {
            // language=cypher
            const cypher = `
              MERGE (l:LabelScheme {name: $labelName, labelId: apoc.create.uuid()})
              SET l.color = $color, l.attributes = $attribs
              RETURN l {.*} AS label`;

            const params = {
                labelName: l.name,
                color: l.color,
                attribs: JSON.stringify(l.attributes),
            };
            return neo4jService
                .write(cypher, params, process.env.DB_TOOL)
                .then((res) => res.records[0].get("label").labelId);
        }

        function writeRelation(r): Promise<string> {
            // language=cypher
            const cypher = `
              MERGE (r:RelationType {name: $labelName, relationId: apoc.create.uuid()})
              SET r.attributes = $attribs, r.connections = $connects
              RETURN r {.*} AS relation`;

            const params = {
                labelName: r.name,
                attribs: JSON.stringify(r.attributes),
                connects: JSON.stringify(r.connections),
            };

            return neo4jService
                .write(cypher, params, process.env.DB_TOOL)
                .then((res) => res.records[0].get("relation").relationId);
        }

        movieLabel = new Label("Movie", "#666", [
            new StringAttribute("title", true, "unknown"),
            new NumberAttribute("released"),
        ]);

        movieLabelId = await writeLabel(movieLabel);
        movieLabel.labelId = movieLabelId;

        personLabel = new Label("Person", "#420", [
            new StringAttribute("name", true, "Done Default"),
            new ColorAttribute("haircolor"),
        ]);

        personLabelId = await writeLabel(personLabel);
        personLabel.labelId = personLabelId;

        actedInRelation = new RelationType(
            "ACTED_IN",
            [new StringAttribute("role")],
            [new Connection("Person", "Movie")],
        );

        actedInRelationId = await writeRelation(actedInRelation);
        actedInRelation.relationId = actedInRelationId;

        followsRelation = new RelationType("FOLLOWS", [], [new Connection("Person", "Person")]);

        followsRelationId = await writeRelation(followsRelation);
        followsRelation.relationId = followsRelationId;
    });

    afterEach(async () => {
        // language=cypher
        const cypher = "MATCH (a) DETACH DELETE a RETURN a";
        const params = {};

        await neo4jService.write(cypher, params, process.env.DB_TOOL);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
        expect(neo4jService).toBeDefined();
        expect(controller).toBeDefined();
    });

    describe("getScheme", () => {
        it("should return the scheme", async () => {
            expect(await controller.getScheme()).toEqual(
                new Scheme([movieLabel, personLabel], [actedInRelation, followsRelation]),
            );
        });
    });

    describe("getAllLabels", () => {
        it("should return all Labels", async () => {
            expect((await controller.getAllLabels()).sort()).toEqual([movieLabel, personLabel].sort());
        });
    });

    describe("getLabel", () => {
        it("should return one label", async () => {
            expect(await controller.getLabel(movieLabelId)).toEqual(movieLabel);
        });

        it("non-existing id should return not found exception", async () => {
            await expect(controller.getLabel(movieLabelId + personLabelId + 100)).rejects.toThrowError(
                NotFoundException,
            );
        });
    });

    describe("getAllRelations", () => {
        it("should return all relations", async () => {
            expect((await controller.getAllRelations()).sort()).toEqual([actedInRelation, followsRelation].sort());
        });
    });

    describe("getRelation", () => {
        it("should return one relation", async () => {
            expect(await controller.getRelation(actedInRelationId)).toEqual(actedInRelation);
        });

        it("non-existing id should return not found exception", async () => {
            await expect(controller.getRelation(actedInRelationId + followsRelationId + 100)).rejects.toThrowError(
                NotFoundException,
            );
        });
    });
});
