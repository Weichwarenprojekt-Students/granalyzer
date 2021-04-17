/**
 * @group db/data-scheme/controller
 */

import { TestingModule } from "@nestjs/testing";
import { DataSchemeController } from "./data-scheme.controller";
import { DataSchemeService } from "./data-scheme.service";
import { Neo4jService } from "nest-neo4j/dist";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { LabelScheme } from "./models/labelScheme";
import { ColorAttribute, NumberAttribute, StringAttribute } from "./models/attributes";
import { RelationType } from "./models/relationType";
import { Connection } from "./models/connection";
import { Scheme } from "./data-scheme.model";
import TestUtil from "../util/test.util";
import { DatabaseUtil } from "../util/database.util";
import Relation from "../relations/relation.model";
import Node from "../nodes/node.model";

describe("DataSchemeController", () => {
    let module: TestingModule;

    let service: DataSchemeService;
    let neo4jService: Neo4jService;
    let controller: DataSchemeController;
    let databaseUtil: DatabaseUtil;
    let testUtil: TestUtil;

    let movieLabel: LabelScheme;
    let personLabel: LabelScheme;
    let actedInRelation: RelationType;
    let followsRelation: RelationType;

    let movieLabelName: string;
    let personLabelName: string;
    let actedInRelationName: string;
    let followsRelationName: string;

    let movieNode1;
    let movieNode2;
    let personNode1;
    let personNode2;
    let relation1;
    let relation2;

    beforeAll(async () => {
        module = await TestUtil.createTestingModule([DataSchemeService], [DataSchemeController]);

        neo4jService = module.get<Neo4jService>(Neo4jService);
        service = module.get<DataSchemeService>(DataSchemeService);
        controller = module.get<DataSchemeController>(DataSchemeController);
        databaseUtil = module.get<DatabaseUtil>(DatabaseUtil);
        testUtil = module.get<TestUtil>(TestUtil);

        await databaseUtil.initDatabase();
    });

    beforeEach(async () => {
        movieLabel = new LabelScheme("Movie", "#666", [
            new StringAttribute("attrOne", true, "unknown"),
            new NumberAttribute("attrTwo"),
        ]);
        movieLabel.name = movieLabelName = await testUtil.writeLabelScheme(movieLabel);

        personLabel = new LabelScheme("Person", "#420", [
            new StringAttribute("attrOne", true, "Done Default"),
            new ColorAttribute("attrTwo"),
        ]);
        personLabel.name = personLabelName = await testUtil.writeLabelScheme(personLabel);

        actedInRelation = new RelationType(
            "ACTED_IN",
            [new StringAttribute("attrOne", false)],
            [new Connection("Person", "Movie")],
        );
        actedInRelation.name = actedInRelationName = await testUtil.writeRelationType(actedInRelation);

        followsRelation = new RelationType("FOLLOWS", [], [new Connection("Person", "Person")]);
        followsRelation.name = followsRelationName = await testUtil.writeRelationType(followsRelation);

        movieNode1 = new Node("The Matrix", "Movie", { attrOne: "The Matrix", attrTwo: 2000 });
        movieNode1.nodeId = await testUtil.writeNode(movieNode1);
        personNode1 = new Node("Keanu Reeves", "Person", { attrOne: "Keanu Reeves", attrTwo: "#420" });
        personNode1.nodeId = await testUtil.writeNode(personNode1);
        relation1 = new Relation("ACTED_IN", personNode1.nodeId, movieNode1.nodeId, { attrOne: "Neo" });
        relation1.relationId = await testUtil.writeRelation(relation1);

        movieNode2 = new Node("Forrest Gump", "Movie", { attrOne: "Forrest Gump", attrTwo: 2000 });
        movieNode2.nodeId = await testUtil.writeNode(movieNode2);
        personNode2 = new Node("Tom Hanks", "Person", { attrOne: "Tom Hanks", attrTwo: "#420" });
        personNode2.nodeId = await testUtil.writeNode(personNode2);
        relation2 = new Relation("ACTED_IN", personNode2.nodeId, movieNode2.nodeId, { attrOne: "Forrest" });
        relation2.relationId = await testUtil.writeRelation(relation2);
    });

    afterEach(async () => {
        await databaseUtil.clearDatabase();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
        expect(neo4jService).toBeDefined();
        expect(controller).toBeDefined();
        expect(testUtil).toBeDefined();
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
            expect((await controller.getAllLabelSchemes()).sort(TestUtil.getSortOrder("name"))).toEqual(
                [movieLabel, personLabel].sort(TestUtil.getSortOrder("name")),
            );
        });
    });

    describe("getLabel", () => {
        it("should return one label", async () => {
            expect(await controller.getLabelScheme(movieLabelName)).toEqual(movieLabel);
        });

        it("non-existing id should return not found exception", async () => {
            await expect(controller.getLabelScheme(movieLabelName + personLabelName + 100)).rejects.toThrowError(
                NotFoundException,
            );
        });
    });

    describe("updateLabelScheme", () => {
        it("should update one Label with the same values", async () => {
            expect({
                ...(await controller.updateLabelScheme(movieLabel.name, movieLabel, false)),
                type: "LabelScheme",
            }).toEqual(movieLabel);
        });

        it("should update one label", async () => {
            const body = {
                name: "Movie",
                color: "#666",
                attributes: [
                    {
                        datatype: "string",
                        name: "attrOne",
                        mandatory: true,
                        defaultValue: "",
                    },
                    {
                        datatype: "string",
                        name: "attrTwo",
                        mandatory: false,
                        defaultValue: "",
                    },
                ],
            };
            expect({
                ...(await controller.updateLabelScheme(movieLabel.name, body, false)),
                type: "LabelScheme",
            }).toEqual(body);
        });

        it("Datatype conflict should throw ConflictException", async () => {
            const body = {
                name: "Movie",
                color: "#666",
                attributes: [
                    {
                        datatype: "number",
                        name: "attrOne",
                        mandatory: true,
                        defaultValue: "",
                    },
                    {
                        datatype: "number",
                        name: "attrTwo",
                        mandatory: false,
                        defaultValue: "",
                    },
                ],
            };
            await expect(controller.updateLabelScheme(movieLabel.name, body, false)).rejects.toThrowError(
                ConflictException,
            );
        });

        it("Missing attr when mandatory should throw ConflictException", async () => {
            const body = {
                name: "Movie",
                color: "#666",
                attributes: [
                    {
                        datatype: "string",
                        name: "attrOne",
                        mandatory: true,
                        defaultValue: "",
                    },
                    {
                        datatype: "string",
                        name: "attrTwo",
                        mandatory: false,
                        defaultValue: "",
                    },
                    {
                        datatype: "string",
                        name: "attrThree",
                        mandatory: true,
                        defaultValue: "",
                    }
                ],
            };
            await expect(controller.updateLabelScheme(movieLabel.name, body, false)).rejects.toThrowError(
                ConflictException,
            );
        });
    });

    describe("getAllRelations", () => {
        it("should return all relations", async () => {
            expect((await controller.getAllRelationTypes()).sort(TestUtil.getSortOrder("name"))).toEqual(
                [actedInRelation, followsRelation].sort(TestUtil.getSortOrder("name")),
            );
        });
    });

    describe("updateRelationType", () => {
        it("should update one relation with the same values", async () => {
            expect({
                ...(await controller.updateRelationType(actedInRelation.name, actedInRelation, false)),
                type: "RelationType",
            }).toEqual(actedInRelation);
        });

        it("should update one relation", async () => {
            const body = {
                name: "ACTED_IN",
                attributes: [
                    {
                        datatype: "string",
                        name: "attrOne",
                        mandatory: false,
                        defaultValue: "",
                    },
                    {
                        datatype: "string",
                        name: "attrTwo",
                        mandatory: false,
                        defaultValue: "",
                    },
                ],
                connections: [
                    {
                        from: "Person",
                        to: "Movie",
                    },
                ],
            };
            expect({
                ...(await controller.updateRelationType(actedInRelation.name, body, false)),
                type: "RelationType",
            }).toEqual(body);
        });

        it("Datatype conflict should throw ConflictException", async () => {
            const body = {
                name: "ACTED_IN",
                attributes: [
                    {
                        datatype: "number",
                        name: "attrOne",
                        mandatory: false,
                        defaultValue: "",
                    },
                ],
                connections: [
                    {
                        from: "Person",
                        to: "Movie",
                    },
                ],
            };
            await expect(controller.updateRelationType(actedInRelation.name, body, false)).rejects.toThrowError(
                ConflictException,
            );
        });

        it("Missing attr when mandatory should throw ConflictException", async () => {
            const body = {
                name: "ACTED_IN",
                attributes: [
                    {
                        datatype: "string",
                        name: "attrOne",
                        mandatory: true,
                        defaultValue: "",
                    },
                    {
                        datatype: "string",
                        name: "attrTwo",
                        mandatory: true,
                        defaultValue: "",
                    },
                ],
                connections: [
                    {
                        from: "Person",
                        to: "Movie",
                    },
                ],
            };
            await expect(controller.updateRelationType(actedInRelation.name, body, false)).rejects.toThrowError(
                ConflictException,
            );
        });
    });

    describe("getRelationType", () => {
        it("should return one relation", async () => {
            expect(await controller.getRelationType(actedInRelationName)).toEqual(actedInRelation);
        });

        it("non-existing id should return not found exception", async () => {
            await expect(
                controller.getRelationType(actedInRelationName + followsRelationName + 100),
            ).rejects.toThrowError(NotFoundException);
        });
    });
});
