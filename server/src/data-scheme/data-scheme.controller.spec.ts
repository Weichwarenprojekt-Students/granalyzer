/**
 * @group db/data-scheme/controller
 */

import { TestingModule } from "@nestjs/testing";
import { DataSchemeController } from "./data-scheme.controller";
import { DataSchemeService } from "./data-scheme.service";
import { Neo4jService } from "nest-neo4j/dist";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { LabelScheme } from "./models/label-scheme.model";
import { ColorAttribute, NumberAttribute, StringAttribute } from "./models/attributes.model";
import { RelationType } from "./models/relation-type.model";
import { Connection } from "./models/connection.model";
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
            expect(await controller.getScheme()).toMatchObject(
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

    describe("addLabelScheme", () => {
        it("should add one label scheme", async () => {
            const body = new LabelScheme("Test", "#666", [
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
            ]);
            expect(await controller.addLabelScheme(body)).toEqual(body);
        });

        it("should throw ConflictException", async () => {
            const body = new LabelScheme("Movie", "#666", [
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
            ]);
            await expect(controller.addLabelScheme(body)).rejects.toThrowError(ConflictException);
        });
    });

    describe("deleteLabelScheme", () => {
        it("should delete one label scheme", async () => {
            expect(await controller.deleteLabelScheme("Movie")).toEqual(movieLabel);
            await expect(controller.getLabelScheme("Movie")).rejects.toThrowError(NotFoundException);
        });

        it("should throw not found exception", async () => {
            await expect(controller.deleteLabelScheme("Not_a_Label")).rejects.toThrowError(NotFoundException);
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
            expect(await controller.updateLabelScheme(movieLabel.name, movieLabel, false)).toEqual(movieLabel);
        });

        it("should update one label", async () => {
            const body = new LabelScheme("Movie", "#666", [
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
            ]);
            expect(await controller.updateLabelScheme(movieLabel.name, body, false)).toEqual(body);
        });

        it("Datatype conflict should throw ConflictException", async () => {
            const body = new LabelScheme("Movie", "#666", [
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
            ]);
            await expect(controller.updateLabelScheme(movieLabel.name, body, false)).rejects.toThrowError(
                ConflictException,
            );
        });

        it("Missing attr when mandatory should throw ConflictException", async () => {
            const body = new LabelScheme("Movie", "#666", [
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
                },
            ]);
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

    describe("addRelationType", () => {
        it("should add one relation", async () => {
            const body = new RelationType(
                "TEST_RELATION",
                [
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
                [
                    {
                        from: "Person",
                        to: "Movie",
                    },
                ],
            );
            expect(await controller.addRelationType(body)).toEqual(body);
        });

        it("should throw ConflictException", async () => {
            const body = new RelationType(
                "ACTED_IN",
                [
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
                [
                    {
                        from: "Person",
                        to: "Movie",
                    },
                ],
            );
            await expect(controller.addRelationType(body)).rejects.toThrowError(ConflictException);
        });
    });

    describe("deleteRelationType", () => {
        it("should delete one relation type", async () => {
            expect(await controller.deleteRelationType("ACTED_IN")).toEqual(actedInRelation);
            await expect(controller.getRelationType("ACTED_IN")).rejects.toThrowError(NotFoundException);
        });

        it("should throw not found exception", async () => {
            await expect(controller.deleteRelationType("NOT_A_RELATION_TYPE")).rejects.toThrowError(NotFoundException);
        });
    });

    describe("updateRelationType", () => {
        it("should update one relation with the same values", async () => {
            expect(await controller.updateRelationType(actedInRelation.name, actedInRelation, false)).toEqual(
                actedInRelation,
            );
        });

        it("should update one relation", async () => {
            const body = new RelationType(
                "ACTED_IN",
                [
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
                [
                    {
                        from: "Person",
                        to: "Movie",
                    },
                ],
            );
            expect(await controller.updateRelationType(actedInRelation.name, body, false)).toEqual(body);
        });

        it("Datatype conflict should throw ConflictException", async () => {
            const body = new RelationType(
                "ACTED_IN",
                [
                    {
                        datatype: "number",
                        name: "attrOne",
                        mandatory: false,
                        defaultValue: "",
                    },
                ],
                [
                    {
                        from: "Person",
                        to: "Movie",
                    },
                ],
            );
            await expect(controller.updateRelationType(actedInRelation.name, body, false)).rejects.toThrowError(
                ConflictException,
            );
        });

        it("Missing attr when mandatory should throw ConflictException", async () => {
            const body = new RelationType(
                "ACTED_IN",
                [
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
                [
                    {
                        from: "Person",
                        to: "Movie",
                    },
                ],
            );
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
