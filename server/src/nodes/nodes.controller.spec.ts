/**
 * @group db/nodes/controller
 */

import { TestingModule } from "@nestjs/testing";
import { NodesController } from "./nodes.controller";
import { Neo4jService } from "nest-neo4j/dist";
import { NodesService } from "./nodes.service";
import Node from "./node.model";
import { NumberAttribute, StringAttribute } from "../data-scheme/models/attributes.model";
import Relation from "../relations/relation.model";
import { RelationType } from "../data-scheme/models/relation-type.model";
import { Connection } from "../data-scheme/models/connection.model";
import { NodesRelationsService } from "./nodes-relations.service";
import TestUtil from "../util/test.util";
import { DatabaseUtil } from "../util/database.util";
import { LabelScheme } from "../data-scheme/models/label-scheme.model";
import { NotFoundException } from "@nestjs/common";
import { RelationsService } from "../relations/relations.service";
import { RelationsController } from "../relations/relations.controller";

describe("NodesController", () => {
    let module: TestingModule;

    let nodesService: NodesService;
    let relationsService: RelationsService;
    let neo4jService: Neo4jService;

    let nodesController: NodesController;
    let relationsController: RelationsController;

    let databaseUtil: DatabaseUtil;
    let testUtil: TestUtil;

    let movieNodeId;
    let validNodeId;
    let nmNodeID;

    let movieNode;
    let validRelation;

    beforeAll(async () => {
        // Create main module for testing
        module = await TestUtil.createTestingModule(
            [NodesService, RelationsService, NodesRelationsService],
            [NodesController, RelationsController],
        );

        nodesController = module.get<NodesController>(NodesController);
        relationsController = module.get<RelationsController>(RelationsController);
        nodesService = module.get<NodesService>(NodesService);
        relationsService = module.get<RelationsService>(RelationsService);
        neo4jService = module.get<Neo4jService>(Neo4jService);
        databaseUtil = module.get<DatabaseUtil>(DatabaseUtil);
        testUtil = module.get<TestUtil>(TestUtil);

        await databaseUtil.initDatabase();
    });

    beforeEach(async () => {
        // Write the label-schemes into the tool-db
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

        // Write the relation-type into tool-db
        const hobbitRelation = new RelationType(
            "isHobbitOf",
            [new StringAttribute("attrOne", false)],
            [new Connection(movieLabel.name, validLabel.name)],
        );
        hobbitRelation.name = await testUtil.writeRelationType(hobbitRelation);

        // Write the actual nodes into the customer-db
        movieNode = new Node("Avengers", "Movie", { attrOne: 1990, attrTwo: "GER" });
        movieNode.nodeId = await testUtil.writeNode(movieNode);
        movieNodeId = movieNode.nodeId;

        const validNode = new Node("ValidNode", "validLabel", { attrOne: 1234, attrTwo: "HansPeter" });
        validNode.nodeId = await testUtil.writeNode(validNode);
        validNodeId = validNode.nodeId;

        const nmNode = new Node("nmNode", "nmLabel", { attrOne: 42, attrTwo: "GER" });
        nmNode.nodeId = await testUtil.writeNode(nmNode);
        nmNodeID = nmNode.nodeId;

        // Write the actual relations into customer-db
        validRelation = new Relation("isHobbitOf", movieNode.nodeId, validNode.nodeId, { attrOne: "Gandalf" });
        validRelation.relationId = await testUtil.writeRelation(validRelation);

        const invalidRelation = new Relation("isHobbitOf", validNode.nodeId, validNode.nodeId, {
            attrOne: "Hermione Granger",
        });
        invalidRelation.relationId = await testUtil.writeRelation(invalidRelation);
    });

    afterEach(async () => {
        await databaseUtil.clearDatabase();
    });

    it("should be defined", () => {
        expect(nodesController).toBeDefined();
        expect(nodesService).toBeDefined();
        expect(relationsService).toBeDefined();
        expect(neo4jService).toBeDefined();
        expect(testUtil).toBeDefined();
    });

    describe("createNode", () => {
        it("should throw an exception because the label is invalid/non-existent", async () => {
            const newNode = {
                name: "The Polar Express",
                label: "IllegalLabel",
                attributes: {
                    attrOne: 2020,
                    attrTwo: "Tom Hanks",
                },
            } as Node;
            await expect(nodesController.createNode(newNode)).rejects.toThrowError(NotFoundException);
        });

        it("should create the node and attributes correctly", async () => {
            const newNode = {
                nodeId: "IllegalCustom-UUID", // Should be ignored
                name: "The Polar Express",
                label: "Movie",
                attributes: {
                    attrOne: 2020,
                    attrTwo: "Tom Hanks",
                    attrThree: "Josh Groban",
                    nodeId: "Another Illegal Custom-UUID", // Should be ignored
                    name: " ", // Invalid name override with empty string, should be ignored
                },
            } as Node;

            const newNodeUUID = (await nodesController.createNode(newNode)).nodeId;
            const actualNode = await testUtil.readDBNode(newNodeUUID);

            expect(actualNode.nodeId).not.toEqual("IllegalCustom-UUID");
            expect(actualNode.nodeId).not.toEqual("Another Illegal Custom-UUID");
            expect(actualNode.label).toEqual("Movie");
            expect(actualNode.name).toEqual("The Polar Express");
            expect(actualNode.attributes).toEqual({
                label: "Movie",
                name: "The Polar Express",
                nodeId: newNodeUUID,
                attrOne: 2020,
                attrTwo: "Tom Hanks",
                attrThree: "Josh Groban",
            });
        });
    });
    describe("deleteNode", () => {
        it("should throw an exception because the uuid is not existent", async () => {
            await expect(nodesController.deleteNode("251608de-a05e-4690-a088-8f603c07768")).rejects.toThrowError(
                NotFoundException,
            );
        });

        it("should delete the node and all its relations correctly", async () => {
            await nodesController.deleteNode(movieNode.nodeId);
            await expect(nodesController.getNode(movieNode.nodeId)).rejects.toThrowError(NotFoundException);
            await expect(relationsController.getRelation(validRelation.relationId)).rejects.toThrowError(
                NotFoundException,
            );
        });

        it("should return the deleted node correctly", async () => {
            const expected = await nodesController.getNode(movieNode.nodeId);
            const actual = await nodesController.deleteNode(movieNode.nodeId);
            await expect(actual).toEqual(expected);
        });
    });
    describe("modifyNode", () => {
        const newNode = {
            nodeId: "IllegalCustom-UUID", // Should be ignored
            name: "The Polar Express", // Should be ignored
            label: "Movie", // Should be ignored
            attributes: {
                attrTwo: "updated",
                attrThree: "Josh Groban",
                nodeId: "Another Illegal Custom-UUID", // Should be ignored
                name: " ", // Invalid name override with empty string, should be ignored
            },
        } as Node;

        it("should throw an exception because the uuid is not existent", async () => {
            await expect(
                nodesController.modifyNode("251608de-a05e-4690-a088-8f603c07768", newNode),
            ).rejects.toThrowError(NotFoundException);
        });

        it("should modify the attributes correctly", async () => {
            const modifiedNodeUUID = (await nodesController.modifyNode(movieNode.nodeId, newNode)).nodeId;
            let actualNode = await testUtil.readDBNode(modifiedNodeUUID);

            expect(actualNode.nodeId).not.toEqual("IllegalCustom-UUID");
            expect(actualNode.nodeId).not.toEqual("Another Illegal Custom-UUID");
            expect(actualNode.label).toEqual("Movie");
            expect(actualNode.name).toEqual("Avengers");
            expect(actualNode.attributes).toEqual({
                label: "Movie",
                name: "Avengers",
                nodeId: modifiedNodeUUID,
                attrTwo: "updated",
                attrThree: "Josh Groban",
            });

            delete newNode.attributes["name"];
            await nodesController.modifyNode(movieNode.nodeId, newNode);
            actualNode = await testUtil.readDBNode(modifiedNodeUUID);
            expect(actualNode.name).toEqual("Avengers");
        });
    });

    describe("getNode", () => {
        it("should get one node", async () => {
            expect((await nodesController.getNode(movieNodeId)).name).toBe("Avengers");
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
            expect(await nodesController.getNode(missingAttributeNode.nodeId)).toEqual({
                ...missingAttributeNode,
            });
        });

        it("should return the attribute the right datatypes", async () => {
            const resultNode = await nodesController.getNode(validNodeId);

            expect(typeof resultNode.attributes.attrOne).toBe("number");
            expect(typeof resultNode.attributes.attrTwo).toBe("string");
        });

        it("should return the node, that has no attributes", async () => {
            const mandaNode = await nodesController.getNode(nmNodeID);

            expect(mandaNode.attributes.attrOne).toEqual(42);
            expect(mandaNode.attributes.attrTwo).toEqual("GER");
            expect(mandaNode.attributes.attrThree).toBeUndefined();
        });

        it("should return attributes which are in data-scheme only", async () => {
            movieNode.attributes["attrThree"] = "additional";
            const response = await nodesController.getNode(movieNode.nodeId);
            expect(response.attributes).toEqual({
                attrOne: 1990,
                attrTwo: "GER",
            });
        });
    });

    describe("getAllNodes", () => {
        it("should return more than one node", async () => {
            expect((await nodesController.getAllNodes()).length).toBeGreaterThan(1);
        });

        it("should return one node", async () => {
            expect((await nodesController.getAllNodes(1, 1)).length).toBe(1);
        });

        it("should return the node with given search term", async () => {
            expect((await nodesController.getAllNodes(20, 0, "Avengers", ["Movie", "validLabel"])).length).toBe(1);
        });
    });

    describe("getRelationsOfNode", () => {
        it("should return all valid relations of the node", async () => {
            const relations: Relation[] = await nodesController.getRelationsOfNode(movieNodeId);

            // Second relation of the node is not valid -> only one is returned
            expect(relations.length).toEqual(1);
            expect(relations[0].from).toEqual(movieNodeId);
            expect(relations[0].to).toEqual(validNodeId);
        });
    });
});
