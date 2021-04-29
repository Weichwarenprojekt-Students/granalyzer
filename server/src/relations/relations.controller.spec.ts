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
import {
    ColorAttribute,
    EnumAttribute,
    NumberAttribute,
    StringAttribute,
} from "../data-scheme/models/attributes.model";
import { Connection } from "../data-scheme/models/connection.model";
import { ArgumentMetadata, NotFoundException } from "@nestjs/common";
import { NodesService } from "../nodes/nodes.service";
import { DataSchemeService } from "../data-scheme/data-scheme.service";
import { NodesController } from "../nodes/nodes.controller";
import { DataSchemeController } from "../data-scheme/data-scheme.controller";
import { NodesRelationsService } from "../nodes/nodes-relations.service";
import { ValidationPipe } from "../validation-pipe";

describe("RelationsController", () => {
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

    // Init services and controllers before testing
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

    afterEach(async () => {
        await databaseUtil.clearDatabase();
    });

    // Check if the creation of controller and services has been performed successfully
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
            metatype: Relation,
            data: "",
        };

        it("throws an exception because the relation type is missing", async () => {
            const newRelation = {
                attributes: {},
                from: "123",
                to: "456",
            };
            await expect(pipeline.transform(newRelation, metadata)).rejects.toThrow();
        });

        it("throws an exception because the from node is invalid", async () => {
            const newRelation = {
                type: "Type",
                attributes: {},
                from: 123,
                to: "456",
            };
            await expect(pipeline.transform(newRelation, metadata)).rejects.toThrow();
        });

        it("throws an exception because the from to node is invalid", async () => {
            const newRelation = {
                type: "Type",
                attributes: {},
                from: "123",
            };
            await expect(pipeline.transform(newRelation, metadata)).rejects.toThrow();
        });

        it("throws an exception because the relation type is not a string", async () => {
            const newRelation = {
                type: 123,
                attributes: {},
                from: "123",
                to: "456",
            };
            await expect(pipeline.transform(newRelation, metadata)).rejects.toThrow();
        });

        it("throws an exception because the node label is missing", async () => {
            const newRelation = {
                name: "Name",
                attributes: {},
            };
            await expect(pipeline.transform(newRelation, metadata)).rejects.toThrow();
        });

        it("throws an exception because the node label is not a string", async () => {
            const newRelation = {
                name: "Name",
                label: 123,
                attributes: {},
            };
            await expect(pipeline.transform(newRelation, metadata)).rejects.toThrow();
        });

        it("throws an exception because the attributes are not a object", async () => {
            const newRelation = {
                type: "Type",
                attributes: "Attributes",
                from: "123",
                to: "456",
            };
            await expect(pipeline.transform(newRelation, metadata)).rejects.toThrow();
        });

        it("throws an exception because the attributes contain a JS object", async () => {
            const newRelation = {
                type: "Type",
                attributes: {
                    attrOne: {},
                },
                from: "123",
                to: "456",
            };
            await expect(pipeline.transform(newRelation, metadata)).rejects.toThrow();
        });
    });

    describe("createRelation", () => {
        it("correctly writes the data to DB", async () => {
            // Write the node labels
            const validStartNodeLabel = new LabelScheme("Movie", "#EEE", []);
            await schemeController.addLabelScheme(validStartNodeLabel);

            const validEndNodeLabel = new LabelScheme("validLabel", "#222", []);
            await schemeController.addLabelScheme(validEndNodeLabel);

            // Write the relation type
            const validRelationType = new RelationType(
                "validRel",
                [
                    new NumberAttribute("released", false, 0),
                    new NumberAttribute("rating", false, 0),
                    new NumberAttribute("max", false, 0),
                    new StringAttribute("genre", false, ""),
                    new StringAttribute("director", false, ""),
                    new ColorAttribute("color", false, ""),
                    new EnumAttribute("download", false, "false", ["false", "true"]),
                ],
                [new Connection(validStartNodeLabel.name, validEndNodeLabel.name)],
            );
            await schemeController.addRelationType(validRelationType);

            // Write the nodes
            const validStartNode = new Node("validStartNode", validStartNodeLabel.name, {});
            validStartNode.nodeId = (await nodesController.createNode(validStartNode)).nodeId;

            const validEndNode = new Node("valdidEndNode", validEndNodeLabel.name, {});
            validEndNode.nodeId = (await nodesController.createNode(validEndNode)).nodeId;

            // Write the relation
            const validRelation = new Relation(validRelationType.name, validStartNode.nodeId, validEndNode.nodeId, {
                released: 2004,
                rating: 3.14,
                max: Number.MAX_VALUE,
                genre: "Fantasy",
                director: "Robert Zemeckis",
                color: "#0000ff",
                download: "true",
            });
            validRelation.relationId = (await relationsController.createRelation(validRelation)).relationId;
            const actual = await relationsController.getRelation(validRelation.relationId, true);
            expect(actual).toEqual({
                relationId: validRelation.relationId,
                type: validRelationType.name,
                from: validStartNode.nodeId,
                to: validEndNode.nodeId,
                attributes: {
                    released: 2004,
                    rating: 3.14,
                    max: Number.MAX_VALUE,
                    genre: "Fantasy",
                    director: "Robert Zemeckis",
                    color: "#0000ff",
                    download: "true",
                },
            });
        });

        it("ignores the relationId", async () => {
            // Write the node labels
            const validStartNodeLabel = new LabelScheme("Movie", "#EEE", []);
            await schemeController.addLabelScheme(validStartNodeLabel);

            const validEndNodeLabel = new LabelScheme("validLabel", "#222", []);
            await schemeController.addLabelScheme(validEndNodeLabel);

            // Write the relation type
            const validRelationType = new RelationType(
                "validRel",
                [],
                [new Connection(validStartNodeLabel.name, validEndNodeLabel.name)],
            );
            await schemeController.addRelationType(validRelationType);

            // Write the nodes
            const validStartNode = new Node("validStartNode", validStartNodeLabel.name, {});
            validStartNode.nodeId = (await nodesController.createNode(validStartNode)).nodeId;

            const validEndNode = new Node("valdidEndNode", validEndNodeLabel.name, {});
            validEndNode.nodeId = (await nodesController.createNode(validEndNode)).nodeId;

            // Write the relation
            const validRelation = new Relation(validRelationType.name, validStartNode.nodeId, validEndNode.nodeId, {
                relationId: "Illegal custom UUID",
            });
            validRelation.relationId = (await relationsController.createRelation(validRelation)).relationId;

            const actual = await relationsController.getRelation(validRelation.relationId, true);
            expect(actual.relationId).not.toEqual("Illegal custom UUID");
        });

        it("ignores relationId variable in attributes", async () => {
            // Write the node labels
            const validStartNodeLabel = new LabelScheme("Movie", "#EEE", []);
            await schemeController.addLabelScheme(validStartNodeLabel);

            const validEndNodeLabel = new LabelScheme("validLabel", "#222", []);
            await schemeController.addLabelScheme(validEndNodeLabel);

            // Write the relation type
            const validRelationType = new RelationType(
                "validRel",
                [],
                [new Connection(validStartNodeLabel.name, validEndNodeLabel.name)],
            );
            await schemeController.addRelationType(validRelationType);

            // Write the nodes
            const validStartNode = new Node("validStartNode", validStartNodeLabel.name, {});
            validStartNode.nodeId = (await nodesController.createNode(validStartNode)).nodeId;

            const validEndNode = new Node("valdidEndNode", validEndNodeLabel.name, {});
            validEndNode.nodeId = (await nodesController.createNode(validEndNode)).nodeId;

            // Write the relation
            const validRelation = new Relation(
                validRelationType.name,
                validStartNode.nodeId,
                validEndNode.nodeId,
                {},
                "Illegal custom UUID",
            );
            validRelation.relationId = (await relationsController.createRelation(validRelation)).relationId;

            const actual = await relationsController.getRelation(validRelation.relationId, true);
            expect(actual.relationId).not.toEqual("Illegal custom UUID");
        });
    });

    describe("deleteRelation", () => {
        it("deletes the relation correctly", async () => {
            // Write the node labels
            const validStartNodeLabel = new LabelScheme("Movie", "#EEE", []);
            await schemeController.addLabelScheme(validStartNodeLabel);

            const validEndNodeLabel = new LabelScheme("validLabel", "#222", []);
            await schemeController.addLabelScheme(validEndNodeLabel);

            // Write the relation type
            const validRelationType = new RelationType(
                "validRel",
                [],
                [new Connection(validStartNodeLabel.name, validEndNodeLabel.name)],
            );
            await schemeController.addRelationType(validRelationType);

            // Write the nodes
            const validStartNode = new Node("validStartNode", validStartNodeLabel.name, {});
            validStartNode.nodeId = (await nodesController.createNode(validStartNode)).nodeId;

            const validEndNode = new Node("valdidEndNode", validEndNodeLabel.name, {});
            validEndNode.nodeId = (await nodesController.createNode(validEndNode)).nodeId;

            // Write the relation
            const validRelation = new Relation(validRelationType.name, validStartNode.nodeId, validEndNode.nodeId, {});
            validRelation.relationId = (await relationsController.createRelation(validRelation)).relationId;

            await relationsController.deleteRelation(validRelation.relationId);
            await expect(relationsController.getRelation(validRelation.relationId, true)).rejects.toThrowError(
                NotFoundException,
            );
        });

        it("returns the deleted relation correctly in accordance with data scheme", async () => {
            // Write the node labels
            const validStartNodeLabel = new LabelScheme("Movie", "#EEE", []);
            await schemeController.addLabelScheme(validStartNodeLabel);

            const validEndNodeLabel = new LabelScheme("validLabel", "#222", []);
            await schemeController.addLabelScheme(validEndNodeLabel);

            // Write the relation type
            const validRelationType = new RelationType(
                "validRel",
                [
                    new StringAttribute("stringAttr", false, "defaultString"),
                    new NumberAttribute("numberAttr", false, 0),
                    new ColorAttribute("colorAttr", false, "#000000"),
                    new EnumAttribute("download", false, "false", ["false", "true"]),
                ],
                [new Connection(validStartNodeLabel.name, validEndNodeLabel.name)],
            );
            await schemeController.addRelationType(validRelationType);

            // Write the nodes
            const validStartNode = new Node("validStartNode", validStartNodeLabel.name, {});
            validStartNode.nodeId = (await nodesController.createNode(validStartNode)).nodeId;

            const validEndNode = new Node("valdidEndNode", validEndNodeLabel.name, {});
            validEndNode.nodeId = (await nodesController.createNode(validEndNode)).nodeId;

            // Write the relation
            const validRelation = new Relation(validRelationType.name, validStartNode.nodeId, validEndNode.nodeId, {
                stringAttr: "relString",
                numberAttr: 21091986,
                colorAttr: "#ff00ff",
                download: "true",
            });
            validRelation.relationId = (await relationsController.createRelation(validRelation)).relationId;

            const expected = await relationsController.getRelation(validRelation.relationId, true);
            const actual = await relationsController.deleteRelation(validRelation.relationId);
            await expect(actual).toEqual(expected);
        });

        it("throws an exception because the uuid is not existent", async () => {
            await expect(
                relationsController.deleteRelation("251608de-a05e-4690-a088-8f603c07768"),
            ).rejects.toThrowError(NotFoundException);
        });
    });

    describe("modifyRelation", () => {
        it("modifies the attributes correctly", async () => {
            // Write the node labels
            const validStartNodeLabel = new LabelScheme("Movie", "#EEE", []);
            await schemeController.addLabelScheme(validStartNodeLabel);

            const validEndNodeLabel = new LabelScheme("validLabel", "#222", []);
            await schemeController.addLabelScheme(validEndNodeLabel);

            // Write the relation type
            const validRelationType = new RelationType(
                "validRel",
                [
                    new StringAttribute("stringAttr", false, "defaultString"),
                    new NumberAttribute("numberAttr", false, 0),
                    new ColorAttribute("colorAttr", false, "#000000"),
                    new StringAttribute("stringAttr2", false, "defaultString2"),
                    new EnumAttribute("download", false, "false", ["false", "true"]),
                ],
                [new Connection(validStartNodeLabel.name, validEndNodeLabel.name)],
            );
            await schemeController.addRelationType(validRelationType);

            // Write the nodes
            const validStartNode = new Node("validStartNode", validStartNodeLabel.name, {});
            validStartNode.nodeId = (await nodesController.createNode(validStartNode)).nodeId;

            const validEndNode = new Node("valdidEndNode", validEndNodeLabel.name, {});
            validEndNode.nodeId = (await nodesController.createNode(validEndNode)).nodeId;

            // Write the relation
            const validRelation = new Relation(validRelationType.name, validStartNode.nodeId, validEndNode.nodeId, {
                stringAttr: "relString",
                numberAttr: 21091986,
                colorAttr: "#ff00ff",
                download: "false",
            });
            validRelation.relationId = (await relationsController.createRelation(validRelation)).relationId;

            const modifiedRelation = new Relation(validRelationType.name, validStartNode.nodeId, validEndNode.nodeId, {
                numberAttr: 21091986,
                colorAttr: "#00ff00",
                stringAttr2: "newString",
                download: "true",
            });
            modifiedRelation.relationId = (
                await relationsController.modifyRelation(validRelation.relationId, modifiedRelation)
            ).relationId;

            const actualRelation = await relationsController.getRelation(modifiedRelation.relationId, true);
            expect(actualRelation).toEqual({
                relationId: validRelation.relationId,
                type: "validRel",
                from: validStartNode.nodeId,
                to: validEndNode.nodeId,
                attributes: {
                    numberAttr: 21091986,
                    colorAttr: "#00ff00",
                    stringAttr2: "newString",
                    download: "true",
                },
            });
        });

        it("ignores the relationId", async () => {
            // Write the node labels
            const validStartNodeLabel = new LabelScheme("Movie", "#EEE", []);
            await schemeController.addLabelScheme(validStartNodeLabel);

            const validEndNodeLabel = new LabelScheme("validLabel", "#222", []);
            await schemeController.addLabelScheme(validEndNodeLabel);

            // Write the relation type
            const validRelationType = new RelationType(
                "validRel",
                [],
                [new Connection(validStartNodeLabel.name, validEndNodeLabel.name)],
            );
            await schemeController.addRelationType(validRelationType);

            // Write the nodes
            const validStartNode = new Node("validStartNode", validStartNodeLabel.name, {});
            validStartNode.nodeId = (await nodesController.createNode(validStartNode)).nodeId;

            const validEndNode = new Node("valdidEndNode", validEndNodeLabel.name, {});
            validEndNode.nodeId = (await nodesController.createNode(validEndNode)).nodeId;

            // Write the relation
            const validRelation = new Relation(validRelationType.name, validStartNode.nodeId, validEndNode.nodeId, {});
            validRelation.relationId = (await relationsController.createRelation(validRelation)).relationId;

            const modifiedRelation = new Relation(
                validRelationType.name,
                validStartNode.nodeId,
                validEndNode.nodeId,
                {},
                "Illegal Custom UUID",
            );
            modifiedRelation.relationId = (
                await relationsController.modifyRelation(validRelation.relationId, modifiedRelation)
            ).relationId;

            expect(modifiedRelation.relationId).toEqual(validRelation.relationId);
        });

        it("ignores relationId variable in attributes", async () => {
            // Write the node labels
            const validStartNodeLabel = new LabelScheme("Movie", "#EEE", []);
            await schemeController.addLabelScheme(validStartNodeLabel);

            const validEndNodeLabel = new LabelScheme("validLabel", "#222", []);
            await schemeController.addLabelScheme(validEndNodeLabel);

            // Write the relation type
            const validRelationType = new RelationType(
                "validRel",
                [],
                [new Connection(validStartNodeLabel.name, validEndNodeLabel.name)],
            );
            await schemeController.addRelationType(validRelationType);

            // Write the nodes
            const validStartNode = new Node("validStartNode", validStartNodeLabel.name, {});
            validStartNode.nodeId = (await nodesController.createNode(validStartNode)).nodeId;

            const validEndNode = new Node("valdidEndNode", validEndNodeLabel.name, {});
            validEndNode.nodeId = (await nodesController.createNode(validEndNode)).nodeId;

            // Write the relation
            const validRelation = new Relation(validRelationType.name, validStartNode.nodeId, validEndNode.nodeId, {});
            validRelation.relationId = (await relationsController.createRelation(validRelation)).relationId;

            const modifiedRelation = new Relation(validRelationType.name, validStartNode.nodeId, validEndNode.nodeId, {
                relationId: "Illegal Custom UUID",
            });
            modifiedRelation.relationId = (
                await relationsController.modifyRelation(validRelation.relationId, modifiedRelation)
            ).relationId;

            expect(modifiedRelation.relationId).toEqual(validRelation.relationId);
        });

        it("throws an exception because the uuid is not existent", async () => {
            // Write the relation
            const validRelation = new Relation("validRel", "123", "456", {});
            await expect(
                relationsController.modifyRelation("251608de-a05e-4690-a088-8f603c07768", validRelation),
            ).rejects.toThrowError(NotFoundException);
        });
    });

    describe("getRelation", () => {
        it("returns the correct relation", async () => {
            // Write the node labels
            const validStartNodeLabel = new LabelScheme("Movie", "#EEE", []);
            await schemeController.addLabelScheme(validStartNodeLabel);

            const validEndNodeLabel = new LabelScheme("validLabel", "#222", []);
            await schemeController.addLabelScheme(validEndNodeLabel);

            // Write the relation type
            const validRelationType = new RelationType(
                "validRel",
                [
                    new NumberAttribute("released", true, 21091986),
                    new NumberAttribute("rating", false, 0),
                    new ColorAttribute("color", true, "#00ff00"),
                    new StringAttribute("test", false, ""),
                    new EnumAttribute("download", false, "false", ["false", "true"]),
                ],
                [new Connection(validStartNodeLabel.name, validEndNodeLabel.name)],
            );
            await schemeController.addRelationType(validRelationType);

            // Write the nodes
            const validStartNode = new Node("validStartNode", validStartNodeLabel.name, {});
            validStartNode.nodeId = (await nodesController.createNode(validStartNode)).nodeId;

            const validEndNode = new Node("valdidEndNode", validEndNodeLabel.name, {});
            validEndNode.nodeId = (await nodesController.createNode(validEndNode)).nodeId;

            // Write the relation
            const validRelation = new Relation(validRelationType.name, validStartNode.nodeId, validEndNode.nodeId, {
                rating: "3.14",
                test: "TestString",
                color: "invalidColor",
                additionalColor: "additionalColor",
                download: "true",
            });
            validRelation.relationId = (await relationsController.createRelation(validRelation)).relationId;

            const actual = await relationsController.getRelation(validRelation.relationId, true);
            expect(actual).toEqual({
                relationId: validRelation.relationId,
                type: validRelationType.name,
                from: validStartNode.nodeId,
                to: validEndNode.nodeId,
                attributes: {
                    released: 21091986,
                    rating: 3.14,
                    color: "#00ff00",
                    test: "TestString",
                    download: "true",
                },
            });
        });

        it("throws an exception because the uuid is not existent", async () => {
            await expect(
                relationsController.getRelation("251608de-a05e-4690-a088-8f603c07768", true),
            ).rejects.toThrowError(NotFoundException);
        });

        it("throws an exception because the label of one of the connected nodes is not in data scheme", async () => {
            // Write the node labels
            const validStartNodeLabel = new LabelScheme("Movie", "#EEE", []);
            await schemeController.addLabelScheme(validStartNodeLabel);

            const invalidEndNodeLabel = new LabelScheme("invalidLabel", "#222", []);
            await schemeController.addLabelScheme(invalidEndNodeLabel);

            // Write the relation type
            const validRelationType = new RelationType(
                "validRel",
                [],
                [new Connection(validStartNodeLabel.name, invalidEndNodeLabel.name)],
            );
            await schemeController.addRelationType(validRelationType);

            // Write the nodes
            const validStartNode = new Node("validStartNode", validStartNodeLabel.name, {});
            validStartNode.nodeId = (await nodesController.createNode(validStartNode)).nodeId;

            const invalidEndNode = new Node("invalidEndNode", invalidEndNodeLabel.name, {});
            invalidEndNode.nodeId = (await nodesController.createNode(invalidEndNode)).nodeId;

            // Write the relation
            const validRelation = new Relation(
                validRelationType.name,
                validStartNode.nodeId,
                invalidEndNode.nodeId,
                {},
            );
            validRelation.relationId = (await relationsController.createRelation(validRelation)).relationId;

            // Delete the label of the end node to make it invalid
            await schemeController.deleteLabelScheme(invalidEndNodeLabel.name);

            await expect(relationsController.getRelation(validRelation.relationId, true)).rejects.toThrowError(
                NotFoundException,
            );
        });

        it("throws an exception because the relation type is not in data scheme", async () => {
            // Write the node labels
            const validStartNodeLabel = new LabelScheme("Movie", "#EEE", []);
            await schemeController.addLabelScheme(validStartNodeLabel);

            const validEndNodeLabel = new LabelScheme("validLabel", "#222", []);
            await schemeController.addLabelScheme(validEndNodeLabel);

            // Write the relation type
            const validRelationType = new RelationType(
                "validRel",
                [],
                [new Connection(validStartNodeLabel.name, validEndNodeLabel.name)],
            );
            await schemeController.addRelationType(validRelationType);

            // Write the nodes
            const validStartNode = new Node("validStartNode", validStartNodeLabel.name, {});
            validStartNode.nodeId = (await nodesController.createNode(validStartNode)).nodeId;

            const validEndNode = new Node("validEndNode", validEndNodeLabel.name, {});
            validEndNode.nodeId = (await nodesController.createNode(validEndNode)).nodeId;

            // Write the relation
            const validRelation = new Relation(validRelationType.name, validStartNode.nodeId, validEndNode.nodeId, {});
            validRelation.relationId = (await relationsController.createRelation(validRelation)).relationId;

            // Delete the relation type of the relation
            await schemeController.deleteRelationType(validRelation.type);

            await expect(relationsController.getRelation(validRelation.relationId, true)).rejects.toThrowError(
                NotFoundException,
            );
        });

        it("throws an exception because the relation has an invalid connection", async () => {
            // Write the node labels
            const validStartNodeLabel = new LabelScheme("Movie", "#EEE", []);
            await schemeController.addLabelScheme(validStartNodeLabel);

            const validEndNodeLabel = new LabelScheme("validLabel", "#222", []);
            await schemeController.addLabelScheme(validEndNodeLabel);

            // Write the relation type
            const validRelationType = new RelationType(
                "validRel",
                [],
                [new Connection(validStartNodeLabel.name, validEndNodeLabel.name)],
            );
            await schemeController.addRelationType(validRelationType);

            // Write the nodes
            const validStartNode = new Node("validStartNode", validStartNodeLabel.name, {});
            validStartNode.nodeId = (await nodesController.createNode(validStartNode)).nodeId;

            const validEndNode = new Node("validEndNode", validEndNodeLabel.name, {});
            validEndNode.nodeId = (await nodesController.createNode(validEndNode)).nodeId;

            // Write the relation
            const validRelation = new Relation(validRelationType.name, validStartNode.nodeId, validEndNode.nodeId, {});
            validRelation.relationId = (await relationsController.createRelation(validRelation)).relationId;

            // Make the created relation invalid
            const modifiedRelationType = new RelationType(
                "validRel",
                [],
                [new Connection(validStartNodeLabel.name, validStartNodeLabel.name)],
            );
            await schemeController.updateRelationType(validRelationType.name, modifiedRelationType, true);

            await expect(relationsController.getRelation(validRelation.relationId, true)).rejects.toThrowError(
                NotFoundException,
            );
        });
    });

    describe("getAllRelations", () => {
        it("returns one relation because the 2nd relation has invalid connections", async () => {
            // Write the node labels
            const validStartNodeLabel = new LabelScheme("Movie", "#EEE", []);
            await schemeController.addLabelScheme(validStartNodeLabel);

            const validEndNodeLabel = new LabelScheme("validLabel", "#222", []);
            await schemeController.addLabelScheme(validEndNodeLabel);

            // Write the relation type
            const validRelationType = new RelationType(
                "validRel",
                [],
                [new Connection(validStartNodeLabel.name, validEndNodeLabel.name)],
            );
            const validRelationType2 = new RelationType(
                "validRel2",
                [],
                [new Connection(validEndNodeLabel.name, validStartNodeLabel.name)],
            );
            await schemeController.addRelationType(validRelationType);
            await schemeController.addRelationType(validRelationType2);

            // Write the nodes
            const validStartNode = new Node("validStartNode", validStartNodeLabel.name, {});
            validStartNode.nodeId = (await nodesController.createNode(validStartNode)).nodeId;

            const validEndNode = new Node("validEndNode", validEndNodeLabel.name, {});
            validEndNode.nodeId = (await nodesController.createNode(validEndNode)).nodeId;

            // Write the relation
            const validRelation = new Relation(validRelationType.name, validStartNode.nodeId, validEndNode.nodeId, {});
            validRelation.relationId = (await relationsController.createRelation(validRelation)).relationId;

            // Write the relation
            const validRelation2 = new Relation(
                validRelationType2.name,
                validEndNode.nodeId,
                validStartNode.nodeId,
                {},
            );
            validRelation2.relationId = (await relationsController.createRelation(validRelation2)).relationId;

            // Make the created relation invalid
            const modifiedRelationType = new RelationType(
                "validRel",
                [],
                [new Connection(validStartNodeLabel.name, validStartNodeLabel.name)],
            );
            await schemeController.updateRelationType(validRelationType.name, modifiedRelationType, true);

            const actual = await relationsController.getAllRelations();
            expect(actual.length).toEqual(1);
            expect(actual[0]).toEqual(validRelation2);
        });

        it("returns one relation because the 2nd relation's node type is not in scheme", async () => {
            // Write the node labels
            const validStartNodeLabel = new LabelScheme("Movie", "#EEE", []);
            await schemeController.addLabelScheme(validStartNodeLabel);

            const invalidEndNodeLabel = new LabelScheme("invalidLabel", "#222", []);
            await schemeController.addLabelScheme(invalidEndNodeLabel);

            const validEndNodeLabel = new LabelScheme("validLabel", "#222", []);
            await schemeController.addLabelScheme(validEndNodeLabel);

            // Write the relation type
            const validRelationType = new RelationType(
                "validRel",
                [],
                [new Connection(validStartNodeLabel.name, invalidEndNodeLabel.name)],
            );
            const validRelationType2 = new RelationType(
                "validRel2",
                [],
                [new Connection(validStartNodeLabel.name, validEndNodeLabel.name)],
            );
            await schemeController.addRelationType(validRelationType);
            await schemeController.addRelationType(validRelationType2);

            // Write the nodes
            const validStartNode = new Node("validStartNode", validStartNodeLabel.name, {});
            validStartNode.nodeId = (await nodesController.createNode(validStartNode)).nodeId;

            const invalidEndNode = new Node("invalidEndNode", invalidEndNodeLabel.name, {});
            invalidEndNode.nodeId = (await nodesController.createNode(invalidEndNode)).nodeId;

            const validEndNode = new Node("validEndNode", validEndNodeLabel.name, {});
            validEndNode.nodeId = (await nodesController.createNode(validEndNode)).nodeId;

            // Write the relations
            const validRelation = new Relation(
                validRelationType.name,
                validStartNode.nodeId,
                invalidEndNode.nodeId,
                {},
            );
            const validRelation2 = new Relation(
                validRelationType2.name,
                validStartNode.nodeId,
                validEndNode.nodeId,
                {},
            );
            validRelation.relationId = (await relationsController.createRelation(validRelation)).relationId;
            validRelation2.relationId = (await relationsController.createRelation(validRelation2)).relationId;

            // Delete the label of the end node to make it invalid
            await schemeController.deleteLabelScheme(invalidEndNodeLabel.name);

            const actual = await relationsController.getAllRelations();
            expect(actual.length).toEqual(1);
            expect(actual[0]).toEqual(validRelation2);
        });

        it("returns one relation because the 2nd relation's type is not in scheme", async () => {
            // Write the node labels
            const validStartNodeLabel = new LabelScheme("Movie", "#EEE", []);
            await schemeController.addLabelScheme(validStartNodeLabel);

            const validEndNodeLabel = new LabelScheme("validLabel", "#222", []);
            await schemeController.addLabelScheme(validEndNodeLabel);

            // Write the relation types
            const validRelationType = new RelationType(
                "validRel",
                [],
                [new Connection(validStartNodeLabel.name, validEndNodeLabel.name)],
            );
            const validRelationType2 = new RelationType(
                "validRel2",
                [],
                [new Connection(validStartNodeLabel.name, validEndNodeLabel.name)],
            );
            await schemeController.addRelationType(validRelationType);
            await schemeController.addRelationType(validRelationType2);

            // Write the nodes
            const validStartNode = new Node("validStartNode", validStartNodeLabel.name, {});
            validStartNode.nodeId = (await nodesController.createNode(validStartNode)).nodeId;

            const validEndNode = new Node("validEndNode", validEndNodeLabel.name, {});
            validEndNode.nodeId = (await nodesController.createNode(validEndNode)).nodeId;

            // Write the relations
            const validRelation = new Relation(validRelationType.name, validStartNode.nodeId, validEndNode.nodeId, {});
            validRelation.relationId = (await relationsController.createRelation(validRelation)).relationId;

            const validRelation2 = new Relation(
                validRelationType2.name,
                validStartNode.nodeId,
                validEndNode.nodeId,
                {},
            );
            validRelation2.relationId = (await relationsController.createRelation(validRelation2)).relationId;

            // Delete the relation type of the relation
            await schemeController.deleteRelationType(validRelation.type);

            const actual = await relationsController.getAllRelations();
            expect(actual.length).toEqual(1);
            expect(actual[0]).toEqual(validRelation2);
        });
    });
});
