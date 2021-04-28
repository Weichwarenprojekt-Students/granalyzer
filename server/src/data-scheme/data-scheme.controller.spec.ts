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
import { NodesService } from "../nodes/nodes.service";
import { RelationsService } from "../relations/relations.service";
import { NodesController } from "../nodes/nodes.controller";
import { RelationsController } from "../relations/relations.controller";
import { NodesRelationsService } from "../nodes/nodes-relations.service";

describe("DataSchemeController", () => {
    let module: TestingModule;
    let databaseUtil: DatabaseUtil;
    let testUtil: TestUtil;

    let neo4jService: Neo4jService;
    let schemeService: DataSchemeService;
    let nodesService: NodesService;
    let relationsService: RelationsService;

    let schemeController: DataSchemeController;
    let nodesController: NodesController;
    let relationsController: RelationsController;

    beforeAll(async () => {
        module = await TestUtil.createTestingModule(
            [DataSchemeService, NodesService, NodesRelationsService, RelationsService],
            [DataSchemeController, NodesController, RelationsController],
        );
        databaseUtil = module.get<DatabaseUtil>(DatabaseUtil);
        testUtil = module.get<TestUtil>(TestUtil);

        neo4jService = module.get<Neo4jService>(Neo4jService);
        schemeService = module.get<DataSchemeService>(DataSchemeService);
        nodesService = module.get<NodesService>(NodesService);
        relationsService = module.get<RelationsService>(RelationsService);

        schemeController = module.get<DataSchemeController>(DataSchemeController);
        nodesController = module.get<NodesController>(NodesController);
        relationsController = module.get<RelationsController>(RelationsController);

        await databaseUtil.initDatabase();
    });

    it("is defined", () => {
        expect(databaseUtil).toBeDefined();
        expect(testUtil).toBeDefined();

        expect(neo4jService).toBeDefined();
        expect(schemeService).toBeDefined();
        expect(relationsService).toBeDefined();
        expect(nodesService).toBeDefined();

        expect(schemeController).toBeDefined();
        expect(nodesController).toBeDefined();
        expect(relationsController).toBeDefined();
    });

    afterEach(async () => {
        await databaseUtil.clearDatabase();
    });

    beforeEach(async () => {
        await databaseUtil.clearDatabase();
    });

    describe("getScheme", () => {
        it("returns the scheme", async () => {
            // Write the labels
            const movieLabel = new LabelScheme("Movie", "#666", [
                new StringAttribute("attrOne", true, "unknown"),
                new NumberAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(movieLabel);

            const personLabel = new LabelScheme("Person", "#420", [
                new StringAttribute("attrOne", true, "Done Default"),
                new ColorAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(personLabel);

            // Write the relation types
            const actedInRelation = new RelationType(
                "ACTED_IN",
                [new StringAttribute("attrOne", false)],
                [new Connection("Person", "Movie")],
            );
            await schemeController.addRelationType(actedInRelation);

            const followsRelation = new RelationType("FOLLOWS", [], [new Connection("Person", "Person")]);
            await schemeController.addRelationType(followsRelation);

            expect(await schemeController.getScheme()).toMatchObject(
                new Scheme([movieLabel, personLabel], [actedInRelation, followsRelation]),
            );
        });
    });

    describe("getAllLabels", () => {
        it("returns all Labels", async () => {
            // Write the labels
            const movieLabel = new LabelScheme("Movie", "#666", [
                new StringAttribute("attrOne", true, "unknown"),
                new NumberAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(movieLabel);

            const personLabel = new LabelScheme("Person", "#420", [
                new StringAttribute("attrOne", true, "Done Default"),
                new ColorAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(personLabel);

            expect((await schemeController.getAllLabelSchemes()).sort(TestUtil.getSortOrder("name"))).toEqual(
                [movieLabel, personLabel].sort(TestUtil.getSortOrder("name")),
            );
        });
    });

    describe("addLabelScheme", () => {
        it("adds one label scheme", async () => {
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
            expect(await schemeController.addLabelScheme(body)).toEqual(body);
        });

        it("throws ConflictException due to already existing label 'Movie'", async () => {
            // Write the label
            const movieLabel = new LabelScheme("Movie", "#666", [
                new StringAttribute("attrOne", true, "unknown"),
                new NumberAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(movieLabel);

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
            await expect(schemeController.addLabelScheme(body)).rejects.toThrowError(ConflictException);
        });
    });

    describe("deleteLabelScheme", () => {
        it("deletes one label scheme", async () => {
            // Write the label
            const movieLabel = new LabelScheme("Movie", "#666", [
                new StringAttribute("attrOne", true, "unknown"),
                new NumberAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(movieLabel);

            expect(await schemeController.deleteLabelScheme("Movie")).toEqual(movieLabel);
            await expect(schemeController.getLabelScheme("Movie")).rejects.toThrowError(NotFoundException);
        });

        it("throws not found exception due to invalid label name", async () => {
            await expect(schemeController.deleteLabelScheme("Not_a_Label")).rejects.toThrowError(NotFoundException);
        });
    });

    describe("getLabel", () => {
        it("returns one label", async () => {
            // Write the labels
            const movieLabel = new LabelScheme("Movie", "#666", [
                new StringAttribute("attrOne", true, "unknown"),
                new NumberAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(movieLabel);

            const personLabel = new LabelScheme("Person", "#420", [
                new StringAttribute("attrOne", true, "Done Default"),
                new ColorAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(personLabel);

            expect(await schemeController.getLabelScheme(movieLabel.name)).toEqual(movieLabel);
        });

        it("throws exception due to non-existing id", async () => {
            await expect(schemeController.getLabelScheme("invalidLabelName")).rejects.toThrowError(NotFoundException);
        });
    });

    describe("updateLabelScheme", () => {
        it("updates one Label with the same values", async () => {
            // Write the label
            const movieLabel = new LabelScheme("Movie", "#666", [
                new StringAttribute("attrOne", true, "unknown"),
                new NumberAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(movieLabel);

            expect(await schemeController.updateLabelScheme(movieLabel.name, movieLabel, false)).toEqual(movieLabel);
        });

        it("updates one label", async () => {
            // Write the label
            const movieLabel = new LabelScheme("Movie", "#666", [
                new StringAttribute("attrOne", true, "unknown"),
                new NumberAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(movieLabel);

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
            expect(await schemeController.updateLabelScheme(movieLabel.name, body, false)).toEqual(body);
        });

        it("throws ConflictException due to datatype conflict", async () => {
            // Write the label
            const movieLabel = new LabelScheme("Movie", "#666", [
                new StringAttribute("attrOne", true, "unknown"),
                new NumberAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(movieLabel);

            // Write the nodes which cause the datatype conflict
            const movieNode1 = new Node("The Matrix", "Movie", { attrOne: "The Matrix", attrTwo: 2000 });
            movieNode1.nodeId = (await nodesController.createNode(movieNode1)).nodeId;

            const movieNode2 = new Node("Forrest Gump", "Movie", { attrOne: "Forrest Gump", attrTwo: 2000 });
            movieNode2.nodeId = (await nodesController.createNode(movieNode2)).nodeId;

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
            await expect(schemeController.updateLabelScheme(movieLabel.name, body, false)).rejects.toThrowError(
                ConflictException,
            );
        });

        it("throws ConflictException due to missing attr when mandatory", async () => {
            // Write the label
            const movieLabel = new LabelScheme("Movie", "#666", [
                new StringAttribute("attrOne", true, "unknown"),
                new NumberAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(movieLabel);

            // Write the nodes which cause the mandatory attribute conflict
            const movieNode1 = new Node("The Matrix", "Movie", { attrOne: "The Matrix", attrTwo: 2000 });
            movieNode1.nodeId = (await nodesController.createNode(movieNode1)).nodeId;

            const movieNode2 = new Node("Forrest Gump", "Movie", { attrOne: "Forrest Gump", attrTwo: 2000 });
            movieNode2.nodeId = (await nodesController.createNode(movieNode2)).nodeId;

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
            await expect(schemeController.updateLabelScheme(movieLabel.name, body, false)).rejects.toThrowError(
                ConflictException,
            );
        });
    });

    describe("getAllRelations", () => {
        it("returns all relations", async () => {
            // Write the labels
            const movieLabel = new LabelScheme("Movie", "#666", [
                new StringAttribute("attrOne", true, "unknown"),
                new NumberAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(movieLabel);

            const personLabel = new LabelScheme("Person", "#420", [
                new StringAttribute("attrOne", true, "Done Default"),
                new ColorAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(personLabel);

            // Write the relation types
            const actedInRelation = new RelationType(
                "ACTED_IN",
                [new StringAttribute("attrOne", false)],
                [new Connection("Person", "Movie")],
            );
            await schemeController.addRelationType(actedInRelation);

            const followsRelation = new RelationType("FOLLOWS", [], [new Connection("Person", "Person")]);
            await schemeController.addRelationType(followsRelation);

            expect((await schemeController.getAllRelationTypes()).sort(TestUtil.getSortOrder("name"))).toEqual(
                [actedInRelation, followsRelation].sort(TestUtil.getSortOrder("name")),
            );
        });
    });

    describe("addRelationType", () => {
        it("adds one relation type", async () => {
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
            expect(await schemeController.addRelationType(body)).toEqual(body);
        });

        it("throws ConflictException due to already existing relation type 'ACTED_IN'", async () => {
            // Write the labels
            const movieLabel = new LabelScheme("Movie", "#666", [
                new StringAttribute("attrOne", true, "unknown"),
                new NumberAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(movieLabel);

            const personLabel = new LabelScheme("Person", "#420", [
                new StringAttribute("attrOne", true, "Done Default"),
                new ColorAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(personLabel);

            // Write the relation which cause the conflict
            const actedInRelation = new RelationType(
                "ACTED_IN",
                [new StringAttribute("attrOne", false)],
                [new Connection("Person", "Movie")],
            );
            await schemeController.addRelationType(actedInRelation);

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
            await expect(schemeController.addRelationType(body)).rejects.toThrowError(ConflictException);
        });
    });

    describe("deleteRelationType", () => {
        it("deletes one relation type", async () => {
            // Write the labels
            const movieLabel = new LabelScheme("Movie", "#666", [
                new StringAttribute("attrOne", true, "unknown"),
                new NumberAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(movieLabel);

            const personLabel = new LabelScheme("Person", "#420", [
                new StringAttribute("attrOne", true, "Done Default"),
                new ColorAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(personLabel);

            // Write the relation which cause the conflict
            const actedInRelation = new RelationType(
                "ACTED_IN",
                [new StringAttribute("attrOne", false)],
                [new Connection("Person", "Movie")],
            );
            await schemeController.addRelationType(actedInRelation);

            expect(await schemeController.deleteRelationType("ACTED_IN")).toEqual(actedInRelation);
            await expect(schemeController.getRelationType("ACTED_IN")).rejects.toThrowError(NotFoundException);
        });

        it("should throw not found exception", async () => {
            await expect(schemeController.deleteRelationType("NOT_A_RELATION_TYPE")).rejects.toThrowError(
                NotFoundException,
            );
        });
    });

    describe("updateRelationType", () => {
        it("updates one relation with the same values", async () => {
            // Write the labels
            const movieLabel = new LabelScheme("Movie", "#666", [
                new StringAttribute("attrOne", true, "unknown"),
                new NumberAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(movieLabel);

            const personLabel = new LabelScheme("Person", "#420", [
                new StringAttribute("attrOne", true, "Done Default"),
                new ColorAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(personLabel);

            // Write the relation type
            const actedInRelation = new RelationType(
                "ACTED_IN",
                [new StringAttribute("attrOne", false)],
                [new Connection("Person", "Movie")],
            );
            await schemeController.addRelationType(actedInRelation);

            expect(await schemeController.updateRelationType(actedInRelation.name, actedInRelation, false)).toEqual(
                actedInRelation,
            );
        });

        it("updates one relation", async () => {
            // Write the labels
            const movieLabel = new LabelScheme("Movie", "#666", [
                new StringAttribute("attrOne", true, "unknown"),
                new NumberAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(movieLabel);

            const personLabel = new LabelScheme("Person", "#420", [
                new StringAttribute("attrOne", true, "Done Default"),
                new ColorAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(personLabel);

            // Write the relation types
            const actedInRelation = new RelationType(
                "ACTED_IN",
                [new StringAttribute("attrOne", false)],
                [new Connection("Person", "Movie")],
            );
            await schemeController.addRelationType(actedInRelation);

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
            expect(await schemeController.updateRelationType(actedInRelation.name, body, false)).toEqual(body);
        });

        it("throws ConflictException due to datatype conflict", async () => {
            // Write the labels
            const movieLabel = new LabelScheme("Movie", "#666", [
                new StringAttribute("attrOne", true, "unknown"),
                new NumberAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(movieLabel);

            const personLabel = new LabelScheme("Person", "#420", [
                new StringAttribute("attrOne", true, "Done Default"),
                new ColorAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(personLabel);

            // Write the relation types
            const actedInRelation = new RelationType(
                "ACTED_IN",
                [new StringAttribute("attrOne", false)],
                [new Connection("Person", "Movie")],
            );
            await schemeController.addRelationType(actedInRelation);

            // Write the nodes which cause the conflict
            const movieNode1 = new Node("The Matrix", "Movie", { attrOne: "The Matrix", attrTwo: 2000 });
            movieNode1.nodeId = (await nodesController.createNode(movieNode1)).nodeId;

            const movieNode2 = new Node("Forrest Gump", "Movie", { attrOne: "Forrest Gump", attrTwo: 2000 });
            movieNode2.nodeId = (await nodesController.createNode(movieNode2)).nodeId;

            const personNode1 = new Node("Keanu Reeves", "Person", { attrOne: "Keanu Reeves", attrTwo: "#420" });
            personNode1.nodeId = (await nodesController.createNode(personNode1)).nodeId;

            const personNode2 = new Node("Tom Hanks", "Person", { attrOne: "Tom Hanks", attrTwo: "#420" });
            personNode2.nodeId = (await nodesController.createNode(personNode2)).nodeId;

            // Create the relations which cause the datatype conflict
            const relation1 = new Relation("ACTED_IN", personNode1.nodeId, movieNode1.nodeId, { attrOne: "Neo" });
            relation1.relationId = (await relationsController.createRelation(relation1)).relationId;

            const relation2 = new Relation("ACTED_IN", personNode2.nodeId, movieNode2.nodeId, { attrOne: "Forrest" });
            relation2.relationId = (await relationsController.createRelation(relation2)).relationId;

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
            await expect(schemeController.updateRelationType(actedInRelation.name, body, false)).rejects.toThrowError(
                ConflictException,
            );
        });

        it("throws ConflictException due to missing attr when mandatory", async () => {
            // Write the labels
            const movieLabel = new LabelScheme("Movie", "#666", [
                new StringAttribute("attrOne", true, "unknown"),
                new NumberAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(movieLabel);

            const personLabel = new LabelScheme("Person", "#420", [
                new StringAttribute("attrOne", true, "Done Default"),
                new ColorAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(personLabel);

            // Write the relation type
            const actedInRelation = new RelationType(
                "ACTED_IN",
                [new StringAttribute("attrOne", false)],
                [new Connection("Person", "Movie")],
            );
            await schemeController.addRelationType(actedInRelation);

            // Write the nodes which cause the conflict
            const movieNode1 = new Node("The Matrix", "Movie", { attrOne: "The Matrix", attrTwo: 2000 });
            movieNode1.nodeId = (await nodesController.createNode(movieNode1)).nodeId;

            const movieNode2 = new Node("Forrest Gump", "Movie", { attrOne: "Forrest Gump", attrTwo: 2000 });
            movieNode2.nodeId = (await nodesController.createNode(movieNode2)).nodeId;

            const personNode1 = new Node("Keanu Reeves", "Person", { attrOne: "Keanu Reeves", attrTwo: "#420" });
            personNode1.nodeId = (await nodesController.createNode(personNode1)).nodeId;

            const personNode2 = new Node("Tom Hanks", "Person", { attrOne: "Tom Hanks", attrTwo: "#420" });
            personNode2.nodeId = (await nodesController.createNode(personNode2)).nodeId;

            // Create the relations which cause the missing mandatory conflict
            const relation1 = new Relation("ACTED_IN", personNode1.nodeId, movieNode1.nodeId, { attrOne: "Neo" });
            relation1.relationId = (await relationsController.createRelation(relation1)).relationId;

            const relation2 = new Relation("ACTED_IN", personNode2.nodeId, movieNode2.nodeId, { attrOne: "Forrest" });
            relation2.relationId = (await relationsController.createRelation(relation2)).relationId;

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
            await expect(schemeController.updateRelationType(actedInRelation.name, body, false)).rejects.toThrowError(
                ConflictException,
            );
        });
    });

    describe("getRelationType", () => {
        it("returns one relation", async () => {
            // Write the labels
            const movieLabel = new LabelScheme("Movie", "#666", [
                new StringAttribute("attrOne", true, "unknown"),
                new NumberAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(movieLabel);

            const personLabel = new LabelScheme("Person", "#420", [
                new StringAttribute("attrOne", true, "Done Default"),
                new ColorAttribute("attrTwo"),
            ]);
            await schemeController.addLabelScheme(personLabel);

            // Write the relation types
            const actedInRelation = new RelationType(
                "ACTED_IN",
                [new StringAttribute("attrOne", false)],
                [new Connection("Person", "Movie")],
            );
            await schemeController.addRelationType(actedInRelation);

            const followsRelation = new RelationType("FOLLOWS", [], [new Connection("Person", "Person")]);
            await schemeController.addRelationType(followsRelation);

            expect(await schemeController.getRelationType(actedInRelation.name)).toEqual(actedInRelation);
        });

        it("throws not found exception due to non-existing id", async () => {
            await expect(schemeController.getRelationType("invalidRelationTypeName")).rejects.toThrowError(
                NotFoundException,
            );
        });
    });
});
