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

describe("RelationsController", () => {
    let module: TestingModule;

    let neo4jService: Neo4jService;
    let databaseUtil: DatabaseUtil;
    let testUtil: TestUtil;

    let controller: RelationsController;
    let service: RelationsService;

    let movieNodeId: string;
    let validNodeId: string;

    let validRelation: Relation;

    // Init services and controllers before testing
    beforeAll(async () => {
        // Create main module for testing
        module = await TestUtil.createTestingModule([RelationsService], [RelationsController]);

        controller = module.get<RelationsController>(RelationsController);
        service = module.get<RelationsService>(RelationsService);

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
        expect(controller).toBeDefined();
        expect(service).toBeDefined();
        expect(neo4jService).toBeDefined();
    });

    describe("getRelation", () => {
        it("should return the correct relation", async () => {
            expect(await controller.getRelation(validRelation.relationId)).toEqual(validRelation);
        });
    });

    describe("getAllRelations", () => {
        it("should return 0 relations when there are no relations", async () => {
            // Clear the database which should make it impossible to find relations
            await databaseUtil.clearDatabase();
            expect((await controller.getAllRelations()).length).toBe(0);
        });

        it("should return 1 relation because there is only one relation in DB", async () => {
            // Clear the database which should make it impossible to find relations
            expect((await controller.getAllRelations()).length).toBe(1);
        });

        it("should contain 2 specific correct relations", async () => {
            // Write the relation
            const validRelation2 = new Relation("directed", validNodeId, movieNodeId, { attrOne: "Peter" });
            validRelation2.relationId = await testUtil.writeRelation(validRelation2);

            expect((await controller.getAllRelations()).sort(TestUtil.getSortOrder("relationId"))).toEqual(
                [{ ...validRelation }, { ...validRelation2 }].sort(TestUtil.getSortOrder("relationId")),
            );
        });
    });
});
