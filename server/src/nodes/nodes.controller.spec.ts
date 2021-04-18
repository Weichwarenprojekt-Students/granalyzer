/**
 * @group db/nodes/controller
 */

import { TestingModule } from "@nestjs/testing";
import { NodesController } from "./nodes.controller";
import { Neo4jService } from "nest-neo4j/dist";
import { NodesService } from "./nodes.service";
import Node from "./node.model";
import { NumberAttribute, StringAttribute } from "../data-scheme/models/attributes.model";
import { InternalServerErrorException } from "@nestjs/common";
import Relation from "../relations/relation.model";
import { RelationType } from "../data-scheme/models/relation-type.model";
import { Connection } from "../data-scheme/models/connection.model";
import { NodesRelationsService } from "./nodes-relations.service";
import TestUtil from "../util/test.util";
import { DatabaseUtil } from "../util/database.util";
import { LabelScheme } from "../data-scheme/models/label-scheme.model";

describe("NodesController", () => {
    let module: TestingModule;

    let service: NodesService;
    let neo4jService: Neo4jService;
    let controller: NodesController;
    let databaseUtil: DatabaseUtil;
    let testUtil: TestUtil;

    let movieNodeId;
    let validNodeId;
    let nmNodeID;

    beforeAll(async () => {
        // Create main module for testing
        module = await TestUtil.createTestingModule([NodesService, NodesRelationsService], [NodesController]);

        controller = module.get<NodesController>(NodesController);
        service = module.get<NodesService>(NodesService);
        neo4jService = module.get<Neo4jService>(Neo4jService);
        databaseUtil = module.get<DatabaseUtil>(DatabaseUtil);
        testUtil = module.get<TestUtil>(TestUtil);

        await databaseUtil.initDatabase();
    });

    beforeEach(async () => {
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

        const nmLabel = new LabelScheme("nmLabel", "#424", [
            new NumberAttribute("attrOne", false, null),
            new StringAttribute("attrTwo", false, null),
            new StringAttribute("attrThree", false, null),
        ]);
        nmLabel.name = await testUtil.writeLabelScheme(nmLabel);

        const movieNode = new Node("Avengers", "Movie", { attrOne: 1990, attrTwo: "GER" });
        movieNode.nodeId = await testUtil.writeNode(movieNode);
        movieNodeId = movieNode.nodeId;

        const validNode = new Node("ValidNode", "validLabel", { attrOne: 1234, attrTwo: "HansPeter" });
        validNode.nodeId = await testUtil.writeNode(validNode);
        validNodeId = validNode.nodeId;

        const nmNode = new Node("nmNode", "nmLabel", { attrOne: 42, attrTwo: "GER" });
        nmNode.nodeId = await testUtil.writeNode(nmNode);
        nmNodeID = nmNode.nodeId;

        /**
         * Mock relations
         */

        const hobbitRelation = new RelationType(
            "isHobbitOf",
            [new StringAttribute("attrOne", false)],
            [new Connection(movieLabel.name, validLabel.name)],
        );
        hobbitRelation.name = await testUtil.writeRelationType(hobbitRelation);

        const validRelation = new Relation("isHobbitOf", movieNode.nodeId, validNode.nodeId, { attrOne: "Gandalf" });
        validRelation.relationId = await testUtil.writeRelation(validRelation);
    });

    afterEach(async () => {
        await databaseUtil.clearDatabase();
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
        expect(service).toBeDefined();
        expect(neo4jService).toBeDefined();
        expect(testUtil).toBeDefined();
    });

    describe("getNode", () => {
        it("should get one node", async () => {
            expect((await controller.getNode(movieNodeId)).name).toBe("Avengers");
        });

        it("should return the node with the default value because attribute it is missing", async () => {
            // Create specific data which causes the default value replacement
            const threePropsLabel = new LabelScheme("ThreeProps", "#333", [
                new NumberAttribute("attrOne", true, 1900),
                new StringAttribute("attrTwo", true, "empty"),
                new StringAttribute("attrThree", true, "empty"),
            ]);
            threePropsLabel.name = await testUtil.writeLabelScheme(threePropsLabel);

            const missingAttributeNode = new Node("MissingNode", "ThreeProps", { attrOne: 1234, attrTwo: "Alfons" });
            missingAttributeNode.nodeId = await testUtil.writeNode(missingAttributeNode);

            missingAttributeNode.attributes["attrThree"] = "empty";
            expect(await controller.getNode(missingAttributeNode.nodeId)).toEqual({
                ...missingAttributeNode,
            });
        });

        it("should return the attribute the right datatypes", async () => {
            const resultNode = await controller.getNode(validNodeId);

            expect(typeof resultNode.attributes.attrOne).toBe("number");
            expect(typeof resultNode.attributes.attrTwo).toBe("string");
        });

        it("should return the node, that has no attributes", async () => {
            const mandaNode = await controller.getNode(nmNodeID);

            expect(mandaNode.attributes.attrOne).toEqual(42);
            expect(mandaNode.attributes.attrTwo).toEqual("GER");
            expect(mandaNode.attributes.attrThree).toBeUndefined();
        });
    });

    describe("searchNode", () => {
        it("should return the searched node", async () => {
            expect((await controller.searchNode("ave")).length).toEqual(1);
        });

        it("should return no node", async () => {
            expect((await controller.searchNode("zxy")).length).toEqual(0);
        });
    });

    describe("getAllNodes", () => {
        it("should return more than one node", async () => {
            expect((await controller.getAllNodes()).length).toBeGreaterThan(1);
        });

        it("should return one node", async () => {
            expect((await controller.getAllNodes(1, 1)).length).toBe(1);
        });
    });

    describe("getRelationsOfNode", () => {
        it("should return all relations of the node", async () => {
            const relations: Relation[] = await controller.getRelationsOfNode(movieNodeId);

            expect(relations.length).toBeGreaterThan(0);
            expect(relations[0].from).toEqual(movieNodeId);
            expect(relations[0].to).toEqual(validNodeId);
        });

        it("should throw an exception", async () => {
            const invalidRelation = new Relation("isHobbitOf", movieNodeId, nmNodeID, { attrOne: "Smaug" });
            invalidRelation.relationId = await testUtil.writeRelation(invalidRelation);
            await expect(controller.getRelationsOfNode(movieNodeId)).rejects.toThrowError(InternalServerErrorException);
        });
    });
});
