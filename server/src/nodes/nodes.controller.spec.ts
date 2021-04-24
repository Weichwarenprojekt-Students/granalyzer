/**
 * @group db/nodes/controller
 */

import { TestingModule } from "@nestjs/testing";
import { NodesController } from "./nodes.controller";
import { Neo4jService } from "nest-neo4j/dist";
import { NodesService } from "./nodes.service";
import Node from "./node.model";
import { ColorAttribute, NumberAttribute, StringAttribute } from "../data-scheme/models/attributes.model";
import Relation from "../relations/relation.model";
import { RelationType } from "../data-scheme/models/relation-type.model";
import { Connection } from "../data-scheme/models/connection.model";
import { NodesRelationsService } from "./nodes-relations.service";
import TestUtil from "../util/test.util";
import { DatabaseUtil } from "../util/database.util";
import { LabelScheme } from "../data-scheme/models/label-scheme.model";
import { ArgumentMetadata, NotFoundException } from "@nestjs/common";
import { RelationsService } from "../relations/relations.service";
import { RelationsController } from "../relations/relations.controller";
import { DataSchemeController } from "../data-scheme/data-scheme.controller";
import { DataSchemeService } from "../data-scheme/data-scheme.service";
import { ValidationPipe } from "../validation-pipe";

describe("NodesController", () => {
    let module: TestingModule;

    let neo4jService: Neo4jService;
    let nodesService: NodesService;
    let relationsService: RelationsService;
    let schemeService: DataSchemeService;

    let nodesController: NodesController;
    let relationsController: RelationsController;
    let schemeController: DataSchemeController;

    let databaseUtil: DatabaseUtil;
    let testUtil: TestUtil;

    beforeAll(async () => {
        // Create main module for testing
        module = await TestUtil.createTestingModule(
            [NodesService, RelationsService, NodesRelationsService, DataSchemeService],
            [NodesController, RelationsController, DataSchemeController],
        );

        neo4jService = module.get<Neo4jService>(Neo4jService);
        nodesService = module.get<NodesService>(NodesService);
        relationsService = module.get<RelationsService>(RelationsService);
        schemeService = module.get<DataSchemeService>(DataSchemeService);

        nodesController = module.get<NodesController>(NodesController);
        relationsController = module.get<RelationsController>(RelationsController);
        schemeController = module.get<DataSchemeController>(DataSchemeController);

        databaseUtil = module.get<DatabaseUtil>(DatabaseUtil);
        testUtil = module.get<TestUtil>(TestUtil);

        await databaseUtil.initDatabase();
    });

    beforeEach(async () => {
        await databaseUtil.clearDatabase();
    });

    it("is defined", () => {
        expect(neo4jService).toBeDefined();
        expect(nodesService).toBeDefined();
        expect(relationsService).toBeDefined();
        expect(schemeService).toBeDefined();

        expect(nodesController).toBeDefined();
        expect(relationsController).toBeDefined();
        expect(schemeController).toBeDefined();

        expect(databaseUtil).toBeDefined();
        expect(testUtil).toBeDefined();
    });

    describe("Validation Pipeline", () => {
        const pipeline: ValidationPipe = new ValidationPipe();
        const metadata: ArgumentMetadata = {
            type: "body",
            metatype: Node,
            data: "",
        };

        it("throws an exception because the node name is missing", async () => {
            const newNode = {
                label: "Label",
                attributes: {},
            };
            await expect(pipeline.transform(newNode, metadata)).rejects.toThrow();
        });

        it("throws an exception because the node name is not a string", async () => {
            const newNode = {
                name: 123,
                label: "Label",
                attributes: {},
            };
            await expect(pipeline.transform(newNode, metadata)).rejects.toThrow();
        });

        it("throws an exception because the node label is missing", async () => {
            const newNode = {
                name: "Name",
                attributes: {},
            };
            await expect(pipeline.transform(newNode, metadata)).rejects.toThrow();
        });

        it("throws an exception because the node label is not a string", async () => {
            const newNode = {
                name: "Name",
                label: 123,
                attributes: {},
            };
            await expect(pipeline.transform(newNode, metadata)).rejects.toThrow();
        });

        it("throws an exception because the attributes are not a object", async () => {
            const newNode = {
                name: "Name",
                label: 123,
                attributes: "Attributes",
            };
            await expect(pipeline.transform(newNode, metadata)).rejects.toThrow();
        });

        it("throws an exception because the attributes contain a JS object", async () => {
            const newNode = {
                name: "Name",
                label: 123,
                attributes: {},
            };
            await expect(pipeline.transform(newNode, metadata)).rejects.toThrow();
        });
    });

    // describe("createNode", () => {
    //     it("correctly writes the data to DB", async () => {
    //         // Write the label scheme
    //         const movieLabel = new LabelScheme("Movie", "#EEE", [
    //             new NumberAttribute("released", false, 0),
    //             new NumberAttribute("rating", false, 0),
    //             new NumberAttribute("minutesplayed", false, 0),
    //             new StringAttribute("genre", false, ""),
    //             new StringAttribute("director", false, ""),
    //             new ColorAttribute("color", false, ""),
    //         ]);
    //         movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;
    //
    //         const newNode = {
    //             name: "The Polar Express",
    //             label: "Movie",
    //             attributes: {
    //                 released: 2004,
    //                 rating: 3.14,
    //                 minutesplayed: Number.MAX_VALUE,
    //                 genre: "Fantasy",
    //                 director: "Robert Zemeckis",
    //                 color: "#0000ff",
    //             },
    //         } as Node;
    //
    //         const uuid = (await nodesController.createNode(newNode)).nodeId;
    //         const actualNode = await nodesController.getNode(uuid);
    //
    //         expect(actualNode).toEqual({
    //             nodeId: uuid,
    //             name: newNode.name,
    //             label: newNode.label,
    //             attributes: {
    //                 released: 2004,
    //                 rating: 3.14,
    //                 minutesplayed: Number.MAX_VALUE,
    //                 genre: "Fantasy",
    //                 director: "Robert Zemeckis",
    //                 color: "#0000ff",
    //             },
    //         });
    //     });
    //
    //     it("returns data in conformity to data-scheme", async () => {
    //         const movieLabel = new LabelScheme("Movie", "#EEE", [
    //             new NumberAttribute("released", false, 0),
    //             new StringAttribute("genre", false, "uncategorized"),
    //         ]);
    //         movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;
    //
    //         const newNode = {
    //             name: "The Polar Express",
    //             label: "Movie",
    //             attributes: {
    //                 released: 2004,
    //                 genre: "Fantasy",
    //                 director: "Robert Zemeckis",
    //                 color: "#0000ff",
    //             },
    //         } as Node;
    //
    //         const actual = await nodesController.createNode(newNode);
    //         const expected = await nodesController.getNode(actual.nodeId);
    //         expect(actual).toEqual(expected);
    //     });
    //
    //     it("throws an exception if UNIQUE node attribute key is violated", async () => {
    //         const movieLabel = new LabelScheme("Movie", "#EEE", [new StringAttribute("name", false, "")]);
    //         movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;
    //
    //         // Write the node constraint
    //         await testUtil.createNodeKeyUNIQUEConstraint("uniqueName", movieLabel.name, "name");
    //
    //         const newNode = {
    //             name: "The Polar Express",
    //             label: movieLabel.name,
    //             attributes: {},
    //         } as Node;
    //         await expect(nodesController.createNode(newNode)).toBeDefined();
    //         await expect(nodesController.createNode(newNode)).rejects.toThrow();
    //     });
    //
    //     // TODO: Fix test
    //     // it("throws an exception if EXISTS node attribute key constraint is violated", async () => {
    //     //     const movieLabel = new LabelScheme("Movie", "#EEE", [new StringAttribute("test", false, "")]);
    //     //     await schemeController.addLabelScheme(movieLabel);
    //     //
    //     //     // Write the node constraint
    //     //     await testUtil.createNodeKeyEXISTSConstraint("existsTest", movieLabel.name, "test");
    //     //
    //     //     const newNode = {
    //     //         name: "The Polar Express",
    //     //         label: movieLabel.name,
    //     //         attributes: {},
    //     //     } as Node;
    //     //     await expect(nodesController.createNode(newNode)).rejects.toThrowError();
    //     // });
    //
    //     it("throws an exception because the label is invalid", async () => {
    //         const newNode = {
    //             name: "The Polar Express",
    //             label: "IllegalLabel",
    //             attributes: {},
    //         } as Node;
    //         await expect(nodesController.createNode(newNode)).rejects.toThrowError(NotFoundException);
    //     });
    //
    //     it("ignores an illegal custom-set UUID", async () => {
    //         // Write the label scheme
    //         const movieLabel = new LabelScheme("Movie", "#EEE", []);
    //         movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;
    //
    //         const newNode = {
    //             nodeId: "Illegal custom UUID",
    //             name: "The Polar Express",
    //             label: "Movie",
    //             attributes: {},
    //         } as Node;
    //
    //         const actualNode = await nodesController.createNode(newNode);
    //         expect(actualNode.nodeId).not.toEqual(newNode.nodeId);
    //     });
    //
    //     it("ignores nodeId variable in attributes", async () => {
    //         // Write the label scheme
    //         const movieLabel = new LabelScheme("Movie", "#EEE", []);
    //         movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;
    //
    //         const newNode = {
    //             name: "The Polar Express",
    //             label: "Movie",
    //             attributes: {
    //                 nodeId: "Illegal custom UUID",
    //             },
    //         } as Node;
    //
    //         const actualNode = await nodesController.createNode(newNode);
    //         expect(actualNode.nodeId).not.toEqual(newNode.attributes.nodeId);
    //     });
    //
    //     it("ignores name variable in attributes", async () => {
    //         // Write the label scheme
    //         const movieLabel = new LabelScheme("Movie", "#EEE", []);
    //         movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;
    //
    //         const newNode = {
    //             name: "The Polar Express",
    //             label: "Movie",
    //             attributes: {
    //                 name: "Illegal custom name",
    //             },
    //         } as Node;
    //
    //         const actualNode = await nodesController.createNode(newNode);
    //         expect(actualNode.name).toEqual(newNode.name);
    //     });
    // });
    //
    // describe("deleteNode", () => {
    //     it("deletes the node and all its relations correctly", async () => {
    //         // Write the label schemes into tool-db
    //         const movieLabel = new LabelScheme("ValidStartNode", "#EEE", []);
    //         movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;
    //
    //         const validLabel = new LabelScheme("ValidEndNode", "#222", []);
    //         validLabel.name = (await schemeController.addLabelScheme(validLabel)).name;
    //
    //         // Write the relation-types into tool-db
    //         const validRelation = new RelationType("validRel", [], [new Connection(movieLabel.name, validLabel.name)]);
    //         validRelation.name = (await schemeController.addRelationType(validRelation)).name;
    //
    //         // Write the actual nodes into the customer-db
    //         const sourceNode = new Node("StartNode", "ValidStartNode", {});
    //         sourceNode.nodeId = (await nodesController.createNode(sourceNode)).nodeId;
    //
    //         const targetNode = new Node("EndNode", "ValidEndNode", {});
    //         targetNode.nodeId = (await nodesController.createNode(targetNode)).nodeId;
    //
    //         // Write the actual relations into customer-db
    //         const sourceTargetRelation = new Relation("validRel", sourceNode.nodeId, targetNode.nodeId, {});
    //         sourceTargetRelation.relationId = (
    //             await relationsController.createRelation(sourceTargetRelation)
    //         ).relationId;
    //
    //         await nodesController.deleteNode(sourceNode.nodeId);
    //         await expect(nodesController.getNode(sourceNode.nodeId)).rejects.toThrowError(NotFoundException);
    //         await expect(relationsController.getRelation(sourceTargetRelation.relationId)).rejects.toThrowError(
    //             NotFoundException,
    //         );
    //     });
    //
    //     it("throws an exception because the UUID is not existent", async () => {
    //         await expect(nodesController.deleteNode("251608de-a05e-4690-a088-8f603c07768")).rejects.toThrowError(
    //             NotFoundException,
    //         );
    //     });
    //
    //     it("returns the deleted node correctly in accordance with data scheme", async () => {
    //         // Write the label scheme
    //         const movieLabel = new LabelScheme("Movie", "#EEE", []);
    //         movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;
    //
    //         const validLabel = new LabelScheme("Valid2", "#222", []);
    //         validLabel.name = (await schemeController.addLabelScheme(validLabel)).name;
    //
    //         // Write the actual nodes into the customer-db
    //         const movieNode = new Node("Avengers", movieLabel.name, { attrOne: 1990, attrTwo: "GER" });
    //         movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;
    //
    //         const validNode = new Node("ValidNode", validLabel.name, { attrOne: 1234, attrTwo: "HansPeter" });
    //         validNode.nodeId = (await nodesController.createNode(validNode)).nodeId;
    //
    //         const expected = await nodesController.getNode(movieNode.nodeId);
    //         const actual = await nodesController.deleteNode(movieNode.nodeId);
    //         expect(actual).toEqual(expected);
    //     });
    // });
    //
    // describe("modifyNode", () => {
    //     it("modifies all data correctly", async () => {
    //         // Write the label scheme
    //         const movieLabel = new LabelScheme("Movie", "#EEE", []);
    //         movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;
    //
    //         const movieNode = {
    //             name: "The Polar Express",
    //             label: "Movie",
    //             attributes: {
    //                 released: 2004,
    //                 genre: "Fantasy",
    //                 director: "Robert Zemeckis",
    //                 color: "#0000ff",
    //             },
    //         } as Node;
    //         movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;
    //
    //         const modifiedNode = {
    //             name: "The Forest",
    //             label: "Movie",
    //             attributes: {
    //                 genre: "Fantasy",
    //                 director: "Tom Hanks",
    //                 color: 1234,
    //                 medium: "DVD",
    //             },
    //         } as Node;
    //         await nodesController.modifyNode(movieNode.nodeId, modifiedNode);
    //
    //         const actual = await testUtil.readDBNode(movieNode.nodeId);
    //         expect(actual).toEqual({
    //             nodeId: movieNode.nodeId,
    //             name: modifiedNode.name,
    //             label: movieNode.label,
    //             attributes: {
    //                 nodeId: movieNode.nodeId,
    //                 name: modifiedNode.name,
    //                 label: movieNode.label,
    //                 ...modifiedNode.attributes,
    //             },
    //         });
    //     });
    //
    //     it("throws an exception if UNIQUE node key is violated", async () => {
    //         // TODO
    //     });
    //
    //     it("throws an exception if EXISTS node key constraint is violated", async () => {
    //         // TODO
    //     });
    //
    //     it("throws an exception because the uuid is not existent", async () => {
    //         const modifiedNode = {
    //             attributes: {},
    //         } as Node;
    //
    //         await expect(
    //             nodesController.modifyNode("251608de-a05e-4690-a088-8f603c07768", modifiedNode),
    //         ).rejects.toThrowError(NotFoundException);
    //     });
    //
    //     it("ignores an illegal custom-set UUID", async () => {
    //         // Write the label scheme
    //         const movieLabel = new LabelScheme("Movie", "#EEE", []);
    //         movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;
    //
    //         const movieNode = {
    //             name: "The Polar Express",
    //             label: "Movie",
    //             attributes: {},
    //         } as Node;
    //         movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;
    //
    //         const modifiedNode = {
    //             nodeId: "Illegal custom UUID",
    //             name: "The Polar Express",
    //             label: "Movie",
    //             attributes: {
    //                 nodeId: "Another Illegal custom UUID",
    //             },
    //         } as Node;
    //
    //         const actualNode = await nodesController.modifyNode(movieNode.nodeId, modifiedNode);
    //         expect(actualNode.nodeId).not.toEqual("Illegal custom UUID");
    //         expect(actualNode.nodeId).not.toEqual("Another Illegal custom UUID");
    //     });
    //
    //     it("ignores an custom-set name in attributes", async () => {
    //         // Write the label scheme
    //         const movieLabel = new LabelScheme("Movie", "#EEE", []);
    //         movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;
    //
    //         const movieNode = {
    //             name: "The Polar Express",
    //             label: "Movie",
    //             attributes: {},
    //         } as Node;
    //         movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;
    //
    //         const modifiedNode = {
    //             name: "Node name",
    //             label: "Movie",
    //             attributes: {
    //                 name: "Attribute name",
    //             },
    //         } as Node;
    //
    //         const actualNode = await nodesController.modifyNode(movieNode.nodeId, modifiedNode);
    //         expect(actualNode.name).toEqual(modifiedNode.name);
    //     });
    // });
    //
    // describe("Attribute Parsing", () => {
    //     it("returns correct datatype of default values", async () => {
    //         // TODO
    //     });
    //
    //     it("returns an undefined value because value is not set and not mandatory", async () => {
    //         // TODO
    //     });
    //
    //     it("returns default value because value is not set and mandatory", async () => {
    //         // TODO
    //     });
    //
    //     it("casts a number attribute from neo4j-long to an integer", async () => {
    //         // TODO
    //     });
    //
    //     it("casts a number attribute from neo4j-float/integer to a float", async () => {
    //         // TODO
    //     });
    //
    //     it("returns an undefined value if the number attribute is non-mandatory and which cannot be casted", async () => {
    //         // TODO
    //     });
    //
    //     it("returns default value if the number attribute is mandatory and which cannot be casted", async () => {
    //         // TODO
    //     });
    //
    //     it("returns default value if the color attribute is mandatory and which is ill-formed", async () => {
    //         // TODO
    //     });
    //
    //     it("returns undefined value if the color attribute is non-mandatory and which is ill-formed", async () => {
    //         // TODO
    //     });
    //
    //     it("casts a string attribute from neo4j-long to string", async () => {
    //         // TODO
    //     });
    //
    //     it("returns default value if the string attribute is mandatory and is not a string", async () => {
    //         // TODO
    //     });
    //
    //     it("returns undefined value if the string attribute is non-mandatory and is not a string", async () => {
    //         // TODO
    //     });
    // });
    //
    // describe("getNode", () => {
    //     it("returns the correct node", async () => {
    //         // TODO
    //     });
    //
    //     it("throws an exception because the UUID is not existent", async () => {
    //         await expect(nodesController.getNode("251608de-a05e-4690-a088-8f603c07768")).rejects.toThrowError(
    //             NotFoundException,
    //         );
    //     });
    //
    //     it("returns nothing because the node label is not in data scheme", async () => {
    //         // TODO
    //     });
    // });
    //
    // describe("getAllNodes", () => {
    //     // TODO: Refactor to check if correct nodes are returned
    //     it("should return more than one node", async () => {
    //         // Write the label schemes into tool-db
    //         const movieLabel = new LabelScheme("Valid1", "#EEE", []);
    //         movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;
    //
    //         const validLabel = new LabelScheme("Valid2", "#222", []);
    //         validLabel.name = (await schemeController.addLabelScheme(validLabel)).name;
    //
    //         // Write the actual nodes into the customer-db
    //         const movieNode = new Node("Node1", "Valid1", {});
    //         movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;
    //
    //         const validNode = new Node("Node2", "Valid2", {});
    //         validNode.nodeId = (await nodesController.createNode(validNode)).nodeId;
    //
    //         expect((await nodesController.getAllNodes()).length).toBeGreaterThan(1);
    //     });
    //
    //     it("returns only nodes whose labels are in the data scheme", async () => {
    //         // TODO
    //     });
    //
    //     it("should return one node", async () => {
    //         // Write the label schemes into tool-db
    //         const movieLabel = new LabelScheme("Valid1", "#EEE", []);
    //         movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;
    //
    //         const validLabel = new LabelScheme("Valid2", "#222", []);
    //         validLabel.name = (await schemeController.addLabelScheme(validLabel)).name;
    //
    //         // Write the actual nodes into the customer-db
    //         const movieNode = new Node("Node1", "Valid1", {});
    //         movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;
    //
    //         const validNode = new Node("Node2", "Valid2", {});
    //         validNode.nodeId = (await nodesController.createNode(validNode)).nodeId;
    //
    //         // const invalidNode = new Node("invalid", invalidLabel.name, {});
    //         // invalidNode.nodeId = (await nodesController.createNode(invalidNode)).nodeId;
    //
    //         expect((await nodesController.getAllNodes(1, 1)).length).toBe(1);
    //     });
    //
    //     it("should return the node with given search term", async () => {
    //         // Write the label schemes into tool-db
    //         const movieLabel = new LabelScheme("Valid1", "#EEE", []);
    //         movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;
    //
    //         const validLabel = new LabelScheme("Valid2", "#222", []);
    //         validLabel.name = (await schemeController.addLabelScheme(validLabel)).name;
    //
    //         // Write the actual nodes into the customer-db
    //         const movieNode = new Node("Node1", "Valid1", {});
    //         movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;
    //
    //         const validNode = new Node("Node2", "Valid2", {});
    //         validNode.nodeId = (await nodesController.createNode(validNode)).nodeId;
    //
    //         expect((await nodesController.getAllNodes(20, 0, "Node1", ["Valid1", "Valid2"])).length).toBe(1);
    //     });
    // });
    //
    // describe("getRelationsOfNode", () => {
    //     it("returns all valid relations of the node", async () => {
    //         // Write the label schemes into tool-db
    //         const startLabel = new LabelScheme("ValidStartNode", "#EEE", []);
    //         startLabel.name = (await schemeController.addLabelScheme(startLabel)).name;
    //
    //         const endLabel = new LabelScheme("ValidEndNode", "#222", []);
    //         endLabel.name = (await schemeController.addLabelScheme(endLabel)).name;
    //
    //         const invalidLabel = new LabelScheme("invalidNode", "#222", []);
    //         invalidLabel.name = (await schemeController.addLabelScheme(invalidLabel)).name;
    //
    //         // Write the relation-types into tool-db
    //         const validRelationType = new RelationType(
    //             "validRel",
    //             [],
    //             [new Connection(startLabel.name, endLabel.name)],
    //         );
    //         validRelationType.name = (await schemeController.addRelationType(validRelationType)).name;
    //
    //         // Write the actual nodes into the customer-db
    //         const sourceNode = new Node("source", startLabel.name, {});
    //         sourceNode.nodeId = (await nodesController.createNode(sourceNode)).nodeId;
    //
    //         const targetNode = new Node("target", endLabel.name, {});
    //         targetNode.nodeId = (await nodesController.createNode(targetNode)).nodeId;
    //
    //         const invalidNode = new Node("invalid", invalidLabel.name, {});
    //         invalidNode.nodeId = (await nodesController.createNode(invalidNode)).nodeId;
    //
    //         // Write the actual relations into customer-db
    //         const validRelation = new Relation(validRelationType.name, sourceNode.nodeId, targetNode.nodeId, {
    //             attrOne: "Test",
    //         });
    //         validRelation.relationId = await testUtil.writeRelation(validRelation);
    //
    //         // Forcefully write invalid relation into DB
    //         const invalidRelation = new Relation("invalid", sourceNode.nodeId, invalidNode.nodeId, {
    //             attrOne: "Test",
    //         });
    //         invalidRelation.relationId = await testUtil.writeRelation(invalidRelation);
    //
    //         const relations: Relation[] = await nodesController.getRelationsOfNode(sourceNode.nodeId);
    //         // Second relation of the node is not valid -> only one is returned
    //         expect(relations.length).toEqual(1);
    //         expect(relations[0].from).toEqual(sourceNode.nodeId);
    //         expect(relations[0].to).toEqual(targetNode.nodeId);
    //     });
    // });
});
