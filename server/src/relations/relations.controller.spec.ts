/**
 * @group db/relations/controller
 */

import { TestingModule } from "@nestjs/testing";
import { RelationsService } from "./relations.service";
import { Neo4jService } from "nest-neo4j/dist";
import { RelationsController } from "./relations.controller";
import TestUtil from "../util/test.util";
import { DatabaseUtil } from "../util/database.util";
import Node from "../nodes/node.model";
import Relation from "./relation.model";
import { LabelScheme } from "../data-scheme/models/label-scheme.model";
import { RelationType } from "../data-scheme/models/relation-type.model";
import { NumberAttribute, StringAttribute } from "../data-scheme/models/attributes.model";
import { Connection } from "../data-scheme/models/connection.model";
import { NotFoundException } from "@nestjs/common";

describe("RelationsController", () => {
    let module: TestingModule;

    let neo4jService: Neo4jService;
    let databaseUtil: DatabaseUtil;
    let testUtil: TestUtil;

    let relationsController: RelationsController;
    let relationsService: RelationsService;

    let movieNodeId: string;
    let validNodeId: string;

    let validRelation: Relation;

    // Init services and controllers before testing
    beforeAll(async () => {
        // Create main module for testing
        module = await TestUtil.createTestingModule([RelationsService], [RelationsController]);

        relationsController = module.get<RelationsController>(RelationsController);
        relationsService = module.get<RelationsService>(RelationsService);

        neo4jService = module.get<Neo4jService>(Neo4jService);
        databaseUtil = module.get<DatabaseUtil>(DatabaseUtil);
        testUtil = module.get<TestUtil>(TestUtil);

        await databaseUtil.initDatabase();
        await databaseUtil.clearDatabase();
    });

    // Create the test data
    beforeEach(async () => {
        // Write the labels
        const movieLabel = new LabelScheme("Movie", "#EEE", [
            new NumberAttribute("attrOne", true, 1900),
            new StringAttribute("attrTwo", false, "empty"),
        ]);
        movieLabel.name = await testUtil.writeLabelScheme(movieLabel);

        const validLabel = new LabelScheme("validLabel", "#222", [
            new NumberAttribute("attrOne", true, 1900),
            new StringAttribute("attrTwo", true, "empty"),
        ]);
        validLabel.name = await testUtil.writeLabelScheme(validLabel);

        // Write the relation types
        const hobbitRelation = new RelationType(
            "isHobbitOf",
            [new StringAttribute("attrOne", false)],
            [new Connection(movieLabel.name, validLabel.name)],
        );
        hobbitRelation.name = await testUtil.writeRelationType(hobbitRelation);

        const directedRelation = new RelationType(
            "directed",
            [new StringAttribute("attrOne", false)],
            [new Connection(validLabel.name, movieLabel.name)],
        );
        directedRelation.name = await testUtil.writeRelationType(directedRelation);

        // Write the nodes
        const movieNode = new Node("Avengers", "Movie", { attrOne: 1990, attrTwo: "GER" });
        movieNode.nodeId = await testUtil.writeNode(movieNode);
        movieNodeId = movieNode.nodeId;

        const validNode = new Node("ValidNode", "validLabel", { attrOne: 1234, attrTwo: "HansPeter" });
        validNode.nodeId = await testUtil.writeNode(validNode);
        validNodeId = validNode.nodeId;

        // Write the relation
        validRelation = new Relation("isHobbitOf", movieNode.nodeId, validNode.nodeId, { attrOne: "Gandalf" });
        validRelation.relationId = await testUtil.writeRelation(validRelation);
    });

    // Clean up the database after each test
    afterEach(async () => {
        await databaseUtil.clearDatabase();
    });

    // Check if the creation of controller and services has been performed successfully
    it("should be defined", () => {
        expect(relationsController).toBeDefined();
        expect(relationsService).toBeDefined();
        expect(neo4jService).toBeDefined();
    });

    describe("modifyRelation", () => {
        const newRelation = {
            relationId: "IllegalCustom-UUID", // Should be ignored
            type: "ACTED_IN", // Should be ignored
            attributes: {
                attrTwo: "updated",
                attrThree: "Josh Groban",
                relationId: "Another Illegal Custom-UUID", // Should be ignored
            },
            from: "invalid", // Should be ignored
            to: "invalid", // Should be ignored
        } as Relation;

        it("should throw an exception because the uuid is not existent", async () => {
            await expect(
                relationsController.modifyRelation("251608de-a05e-4690-a088-8f603c07768", newRelation),
            ).rejects.toThrowError(NotFoundException);
        });
        it("should modify the attributes correctly", async () => {
            const modifiedRelationUUID = (
                await relationsController.modifyRelation(validRelation.relationId, newRelation)
            ).relationId;
            const actualRelation = await testUtil.readDBRelation(modifiedRelationUUID);

            expect(actualRelation.relationId).not.toEqual("IllegalCustom-UUID");
            expect(actualRelation.relationId).not.toEqual("Another Illegal Custom-UUID");
            expect(actualRelation.type).toEqual("isHobbitOf");
            expect(actualRelation.attributes).toEqual({
                type: "isHobbitOf",
                relationId: modifiedRelationUUID,
                attrTwo: "updated",
                attrThree: "Josh Groban",
                from: movieNodeId,
                to: validNodeId,
            });
        });
    });

    describe("deleteRelation", () => {
        it("should throw an exception because the uuid is not existent", async () => {
            await expect(
                relationsController.deleteRelation("251608de-a05e-4690-a088-8f603c07768"),
            ).rejects.toThrowError(NotFoundException);
        });
        it("should delete the relation correctly", async () => {
            await relationsController.deleteRelation(validRelation.relationId);
            await expect(relationsController.getRelation(validRelation.relationId)).rejects.toThrowError(
                NotFoundException,
            );
        });
        it("should return the relation correctly", async () => {
            const expected = await relationsController.getRelation(validRelation.relationId);
            const actual = await relationsController.deleteRelation(validRelation.relationId);
            await expect(actual).toEqual(expected);
        });
    });

    describe("getRelation", () => {
        it("should throw an exception because the uuid is not existent", async () => {
            await expect(relationsController.getRelation("251608de-a05e-4690-a088-8f603c07768")).rejects.toThrowError(
                NotFoundException,
            );
        });

        it("should return the correct relation", async () => {
            expect(await relationsController.getRelation(validRelation.relationId)).toEqual(validRelation);
        });

        it("should return attributes which are in data-scheme only", async () => {
            validRelation.attributes["attrTwo"] = "additional";
            const response = await relationsController.getRelation(validRelation.relationId);
            expect(response.attributes).toEqual({
                attrOne: "Gandalf",
            });
        });
    });

    describe("getAllRelations", () => {
        it("should return 0 relations when there are no relations", async () => {
            // Clear the database which should make it impossible to find relations
            await databaseUtil.clearDatabase();
            expect((await relationsController.getAllRelations()).length).toBe(0);
        });

        it("should return 1 relation because there is only one relation in DB", async () => {
            // Clear the database which should make it impossible to find relations
            expect((await relationsController.getAllRelations()).length).toBe(1);
        });

        it("should contain 2 specific correct relations", async () => {
            // Write the relation
            const validRelation2 = new Relation("directed", validNodeId, movieNodeId, { attrOne: "Peter" });
            validRelation2.relationId = await testUtil.writeRelation(validRelation2);

            expect((await relationsController.getAllRelations()).sort(TestUtil.getSortOrder("relationId"))).toEqual(
                [{ ...validRelation }, { ...validRelation2 }].sort(TestUtil.getSortOrder("relationId")),
            );
        });
    });
});
