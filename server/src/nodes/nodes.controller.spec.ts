/**
 * @group db/nodes/controller
 */

import { TestingModule } from "@nestjs/testing";
import { NodesController } from "./nodes.controller";
import { Neo4jService } from "nest-neo4j/dist";
import { NodesService } from "./nodes.service";
import Node from "./node.model";
import {
    ColorAttribute,
    EnumAttribute,
    NumberAttribute,
    StringAttribute,
} from "../data-scheme/models/attributes.model";
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

    afterEach(async () => {
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

    describe("Attribute Parsing", () => {
        it("returns correct datatype of default values", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", [
                new StringAttribute("stringAttr", true, "TestString"),
                new NumberAttribute("intAttr", true, 21091986),
                new NumberAttribute("doubleAttr", true, 3.14),
                new ColorAttribute("colorAttr", true, "#00ff00"),
                new EnumAttribute("enumAttr", true, "true", ["false", "true"]),
            ]);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const movieNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {},
            } as Node;
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const actualNode = await nodesController.getNode(movieNode.nodeId, true);
            expect(actualNode.attributes).toEqual({
                stringAttr: "TestString",
                intAttr: 21091986,
                doubleAttr: 3.14,
                colorAttr: "#00ff00",
                enumAttr: "true",
            });
        });

        it("returns undefined value because value is not set and the attribute is non-mandatory", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", [
                new StringAttribute("stringAttr", false, "TestString"),
            ]);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const movieNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {},
            } as Node;
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const actualNode = await nodesController.getNode(movieNode.nodeId, true);
            expect(actualNode.attributes.stringAttr).toBeUndefined();
        });

        it("returns default value because value is not set, the attribute is mandatory and includefault is true", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", [
                new StringAttribute("stringAttr", true, "TestString"),
            ]);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const movieNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {},
            } as Node;
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const actualNode = await nodesController.getNode(movieNode.nodeId, true);
            expect(actualNode.attributes.stringAttr).toBe("TestString");
        });

        it("returns undefined value because value is not set, the attribute is mandatory and includefault is false", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", [
                new StringAttribute("stringAttr", true, "TestString"),
            ]);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const movieNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {},
            } as Node;
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const actualNode = await nodesController.getNode(movieNode.nodeId, false);
            expect(actualNode.attributes.stringAttr).toBeUndefined();
        });

        it("returns undefined value if the value cannot be parsed and attribute is non-mandatory", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", [
                new StringAttribute("stringAttr", false, "TestString"),
                new StringAttribute("objString", false, "TestString2"),
                new NumberAttribute("numberAttr", false, 3.14),
                new ColorAttribute("colorAttr", false, "#00ff00"),
                new EnumAttribute("enumAttr", false, "true", ["false", "true"]),
            ]);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const movieNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {
                    stringAttr: "^invalid<|/*/-+String?$%&",
                    objString: '?#§["Value1", "Value2"]',
                    numberAttr: "ff##00ff",
                    doubleAttr: "440?21",
                    enumAttr: "illegalEnumeral",
                },
            } as Node;
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const actualNode = await nodesController.getNode(movieNode.nodeId, true);
            expect(actualNode.attributes.stringAttr).toBe("^invalid<|/*/-+String?$%&");
            expect(actualNode.attributes.objString).toBe('?#§["Value1", "Value2"]');
            expect(actualNode.attributes.numberAttr).toBeUndefined();
            expect(actualNode.attributes.colorAttr).toBeUndefined();
            expect(actualNode.attributes.enumAttr).toBeUndefined();
        });

        it("returns default value if the value cannot be parsed, includefault is true and attribute is mandatory", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", [
                new StringAttribute("stringAttr", true, "TestString"),
                new StringAttribute("objString", true, "TestString2"),
                new NumberAttribute("numberAttr", true, 3.14),
                new ColorAttribute("colorAttr", true, "#00ff00"),
                new EnumAttribute("enumAttr", true, "true", ["false", "true"]),
            ]);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const movieNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {
                    stringAttr: "^invalid<|/*/-+String?$%&",
                    objString: '?#§["Value1", "Value2"]',
                    numberAttr: "ff##00ff",
                    colorAttr: "440?21",
                    enumAttr: "illegalEnumeral",
                },
            } as Node;
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const actualNode = await nodesController.getNode(movieNode.nodeId, true);
            expect(actualNode.attributes.stringAttr).toBe("^invalid<|/*/-+String?$%&");
            expect(actualNode.attributes.objString).toBe('?#§["Value1", "Value2"]');
            expect(actualNode.attributes.numberAttr).toBe(3.14);
            expect(actualNode.attributes.colorAttr).toBe("#00ff00");
            expect(actualNode.attributes.enumAttr).toBe("true");
        });

        it("returns undefined value if the value cannot be parsed, includefault is false and attribute is mandatory", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", [
                new StringAttribute("stringAttr", true, "TestString"),
                new StringAttribute("objString", true, "TestString2"),
                new NumberAttribute("numberAttr", true, 3.14),
                new ColorAttribute("colorAttr", true, "#00ff00"),
                new EnumAttribute("enumAttr", true, "true", ["false", "true"]),
            ]);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const movieNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {
                    stringAttr: "^invalid<|/*/-+String?$%&",
                    objString: '?#§["Value1", "Value2"]',
                    numberAttr: "ff##00ff",
                    colorAttr: "440?21",
                    enumAttr: "illegalEnumeral",
                },
            } as Node;
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const actualNode = await nodesController.getNode(movieNode.nodeId, false);
            expect(actualNode.attributes.stringAttr).toBe("^invalid<|/*/-+String?$%&");
            expect(actualNode.attributes.objString).toBe('?#§["Value1", "Value2"]');
            expect(actualNode.attributes.numberAttr).toBeUndefined();
            expect(actualNode.attributes.colorAttr).toBeUndefined();
            expect(actualNode.attributes.enumAttr).toBeUndefined();
        });

        it("if attribute is declared as ENUM and is enum string, returns enum", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", [
                new EnumAttribute("enumAttr", true, "false", ["false", "true"]),
            ]);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const movieNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {
                    enumAttr: "true",
                },
            } as Node;
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const actualNode = await nodesController.getNode(movieNode.nodeId, false);
            expect(actualNode.attributes.enumAttr).toBe("true");
        });

        it("if attribute is declared as number and is integer/long, returns integer", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", [new NumberAttribute("numberAttr", false, 0)]);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const movieNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {
                    numberAttr: 21091986,
                },
            } as Node;
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const actualNode = await nodesController.getNode(movieNode.nodeId, false);
            expect(actualNode.attributes.numberAttr).toBe(21091986);
        });

        it("if attribute is declared as number and is float/double, returns float/double", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", [new NumberAttribute("numberAttr", false, 0)]);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const movieNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {
                    numberAttr: 3.14,
                },
            } as Node;
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const actualNode = await nodesController.getNode(movieNode.nodeId, false);
            expect(actualNode.attributes.numberAttr).toBe(3.14);
        });

        it("if attribute is declared as number and is string, returns float", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", [
                new NumberAttribute("numberAttr", false, 0),
                new NumberAttribute("numberAttr2", false, 0),
            ]);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const movieNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {
                    numberAttr: "3.14",
                    numberAttr2: "21091986",
                },
            } as Node;
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const actualNode = await nodesController.getNode(movieNode.nodeId, false);
            expect(actualNode.attributes.numberAttr).toBe(3.14);
            expect(actualNode.attributes.numberAttr2).toBe(21091986.0);
        });

        it("if attribute is declared as color, returns color if valid", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", [new ColorAttribute("colorAttr", false, "#000000")]);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const movieNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {
                    colorAttr: "#ff00ff",
                },
            } as Node;
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const actualNode = await nodesController.getNode(movieNode.nodeId, false);
            expect(actualNode.attributes.colorAttr).toBe("#ff00ff");
        });

        it("if attribute is declared as string, converts value from DB to JSON string if it is not a string", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", [
                new StringAttribute("string", false, "emptyDefault"),
                new StringAttribute("string2", false, "emptyDefault"),
                new StringAttribute("string3", false, "emptyDefault"),
            ]);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;
            const movieNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {
                    string: false,
                    string2: true,
                    string3: ["Value1", "Value2"],
                },
            } as Node;
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const actualNode = await nodesController.getNode(movieNode.nodeId, true);
            expect(actualNode.attributes.string).toBe(JSON.stringify(false));
            expect(actualNode.attributes.string2).toBe(JSON.stringify(true));
            expect(actualNode.attributes.string3).toBe(JSON.stringify(["Value1", "Value2"]));
        });

        it("if attribute is declared as string, returns string if it is not an object", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", [new StringAttribute("string", false, "emptyDefault")]);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;
            const movieNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {
                    string: "AttributeString",
                },
            } as Node;
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const actualNode = await nodesController.getNode(movieNode.nodeId, true);
            expect(actualNode.attributes.string).toBe("AttributeString");
        });
    });

    describe("createNode", () => {
        it("correctly writes the data to DB", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", [
                new NumberAttribute("released", false, 0),
                new NumberAttribute("rating", false, 0),
                new NumberAttribute("max", false, 0),
                new StringAttribute("genre", false, ""),
                new StringAttribute("director", false, ""),
                new ColorAttribute("color", false, ""),
                new EnumAttribute("download", true, "true", ["false", "true"]),
            ]);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const newNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {
                    released: 2004,
                    rating: 3.14,
                    max: Number.MAX_VALUE,
                    genre: "Fantasy",
                    director: "Robert Zemeckis",
                    color: "#0000ff",
                    download: "true",
                },
            } as Node;

            const uuid = (await nodesController.createNode(newNode)).nodeId;
            const actualNode = await nodesController.getNode(uuid, true);
            expect(actualNode).toEqual({
                nodeId: uuid,
                name: newNode.name,
                label: newNode.label,
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

        it("returns data in conformity to data-scheme", async () => {
            const movieLabel = new LabelScheme("Movie", "#EEE", [
                new NumberAttribute("released", false, 0),
                new StringAttribute("genre", false, "uncategorized"),
            ]);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const newNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {
                    released: 2004,
                    rating: 3.14,
                    genre: "Fantasy",
                    director: "Robert Zemeckis",
                    color: "#0000ff",
                    download: "false",
                },
            } as Node;

            const actual = await nodesController.createNode(newNode);
            const expected = await nodesController.getNode(actual.nodeId, true);
            expect(actual).toEqual(expected);
        });

        it("ignores nodeId", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", []);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const newNode = {
                nodeId: "Illegal custom UUID",
                name: "The Polar Express",
                label: "Movie",
                attributes: {},
            } as Node;

            const actualNode = await nodesController.createNode(newNode);
            expect(actualNode.nodeId).not.toEqual(newNode.nodeId);
        });

        it("ignores nodeId variable in attributes", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", []);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const newNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {
                    nodeId: "Illegal custom UUID",
                },
            } as Node;

            const actualNode = await nodesController.createNode(newNode);
            expect(actualNode.nodeId).not.toEqual(newNode.attributes.nodeId);
        });

        it("ignores name variable in attributes", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", []);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const newNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {
                    name: "Illegal custom name",
                },
            } as Node;

            const actualNode = await nodesController.createNode(newNode);
            expect(actualNode.name).toEqual(newNode.name);
        });
    });

    describe("deleteNode", () => {
        it("deletes the node and all its relations correctly", async () => {
            // Write the label schemes into tool-db
            const validStartLabel = new LabelScheme("ValidStartNode", "#EEE", []);
            validStartLabel.name = (await schemeController.addLabelScheme(validStartLabel)).name;

            const validEndLabel = new LabelScheme("ValidEndNode", "#222", []);
            validEndLabel.name = (await schemeController.addLabelScheme(validEndLabel)).name;

            // Write the relation-type into tool-db
            const validRelation = new RelationType(
                "validRel",
                [],
                [new Connection(validStartLabel.name, validEndLabel.name)],
            );
            validRelation.name = (await schemeController.addRelationType(validRelation)).name;

            // Write the actual nodes into the customer-db
            const sourceNode = new Node("StartNode", validStartLabel.name, {});
            sourceNode.nodeId = (await nodesController.createNode(sourceNode)).nodeId;

            const targetNode = new Node("EndNode", validEndLabel.name, {});
            targetNode.nodeId = (await nodesController.createNode(targetNode)).nodeId;

            // Write the actual relations into customer-db
            const sourceTargetRelation = new Relation("validRel", sourceNode.nodeId, targetNode.nodeId, {});
            sourceTargetRelation.relationId = (
                await relationsController.createRelation(sourceTargetRelation)
            ).relationId;

            await nodesController.deleteNode(sourceNode.nodeId);
            await expect(nodesController.getNode(sourceNode.nodeId, true)).rejects.toThrowError(NotFoundException);
            await expect(relationsController.getRelation(sourceTargetRelation.relationId, true)).rejects.toThrowError(
                NotFoundException,
            );
        });

        it("throws an exception because the UUID is not existent", async () => {
            await expect(nodesController.deleteNode("251608de-a05e-4690-a088-8f603c07768")).rejects.toThrowError(
                NotFoundException,
            );
        });

        it("returns the deleted node correctly in accordance with data scheme", async () => {
            // Write the label scheme into tool-db
            const validNode1Label = new LabelScheme("ValidStartNode", "#EEE", [
                new StringAttribute("attrOne", false, ""),
            ]);
            validNode1Label.name = (await schemeController.addLabelScheme(validNode1Label)).name;

            // Write the actual node into the customer-db
            const validNode1 = new Node("StartNode", validNode1Label.name, { attrOne: "Test" });
            validNode1.nodeId = (await nodesController.createNode(validNode1)).nodeId;

            const expected = await nodesController.getNode(validNode1.nodeId, true);
            const actual = await nodesController.deleteNode(validNode1.nodeId);
            expect(actual).toEqual(expected);
        });
    });

    describe("modifyNode", () => {
        it("modifies all data correctly", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", [
                new StringAttribute("genre", false, ""),
                new StringAttribute("director", false, ""),
                new NumberAttribute("year", false, 0),
                new EnumAttribute("download", true, "false", ["false", "true"]),
            ]);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const movieNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {
                    released: 2004,
                    genre: "Fantasy",
                    director: "Robert Zemeckis",
                    download: "false",
                },
            } as Node;
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const modifiedNode = {
                name: "The Forest",
                label: "Movie",
                attributes: {
                    genre: "Fantasy",
                    director: "Tom Hanks",
                    year: 2004,
                    download: "true",
                },
            } as Node;
            await nodesController.modifyNode(movieNode.nodeId, modifiedNode);

            const actual = await nodesController.getNode(movieNode.nodeId, true);
            expect(actual).toEqual({
                nodeId: actual.nodeId,
                name: "The Forest",
                label: "Movie",
                attributes: {
                    genre: "Fantasy",
                    director: "Tom Hanks",
                    year: 2004,
                    download: "true",
                },
            });
        });

        it("throws an exception because the uuid is not existent", async () => {
            const modifiedNode = {
                attributes: {},
            } as Node;

            await expect(
                nodesController.modifyNode("251608de-a05e-4690-a088-8f603c07768", modifiedNode),
            ).rejects.toThrowError(NotFoundException);
        });

        it("ignores an illegal custom-set UUID", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", []);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const movieNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {},
            } as Node;
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const modifiedNode = {
                nodeId: "Illegal custom UUID",
                name: "The Polar Express",
                label: "Movie",
                attributes: {
                    nodeId: "Another Illegal custom UUID",
                },
            } as Node;

            const actualNode = await nodesController.modifyNode(movieNode.nodeId, modifiedNode);
            expect(actualNode.nodeId).not.toEqual("Illegal custom UUID");
            expect(actualNode.nodeId).not.toEqual("Another Illegal custom UUID");
        });

        it("updates name with name field and ignores a custom-set name in attributes", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", []);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const movieNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {},
            } as Node;
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const modifiedNode = {
                name: "Node name",
                label: "Movie",
                attributes: {
                    name: "Attribute name",
                },
            } as Node;

            const actualNode = await nodesController.modifyNode(movieNode.nodeId, modifiedNode);
            expect(actualNode.name).toEqual(modifiedNode.name);
        });
    });

    describe("getNode", () => {
        it("returns the correct node", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", [
                new NumberAttribute("released", true, 21091986),
                new NumberAttribute("rating", false, 0),
                new ColorAttribute("color", true, "#00ff00"),
                new StringAttribute("test", false, ""),
            ]);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const newNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {
                    rating: "3.14",
                    test: "TestString",
                    color: "invalidColor",
                    additionalColor: "additionalColor",
                },
            } as Node;

            const uuid = (await nodesController.createNode(newNode)).nodeId;
            const actualNode = await nodesController.getNode(uuid, true);

            expect(actualNode).toEqual({
                nodeId: uuid,
                name: newNode.name,
                label: newNode.label,
                attributes: {
                    released: 21091986,
                    rating: 3.14,
                    color: "#00ff00",
                    test: "TestString",
                },
            });
        });

        it("throws an exception because the UUID is not existent", async () => {
            await expect(nodesController.getNode("251608de-a05e-4690-a088-8f603c07768", true)).rejects.toThrowError(
                NotFoundException,
            );
        });

        it("throws an exception because the node label is not in data scheme", async () => {
            // Write the label scheme
            const movieLabel = new LabelScheme("Movie", "#EEE", []);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            // Write the label scheme
            const movieNode = {
                name: "The Polar Express",
                label: "Movie",
                attributes: {},
            } as Node;
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            // Delete the scheme
            await schemeController.deleteLabelScheme(movieLabel.name);
            await expect(nodesController.getNode(movieNode.nodeId, true)).rejects.toThrowError(NotFoundException);
        });
    });

    describe("getAllNodes", () => {
        it("returns more than one node", async () => {
            // Write the label schemes into tool-db
            const movieLabel = new LabelScheme("Valid1", "#EEE", []);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const validLabel = new LabelScheme("Valid2", "#222", []);
            validLabel.name = (await schemeController.addLabelScheme(validLabel)).name;

            // Write the actual nodes into the customer-db
            const movieNode = new Node("Node1", "Valid1", {});
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const validNode = new Node("Node2", "Valid2", {});
            validNode.nodeId = (await nodesController.createNode(validNode)).nodeId;

            expect((await nodesController.getAllNodes(100, 0, "", [])).length).toBeGreaterThan(1);
        });

        it("returns two nodes because the third's label is not in scheme", async () => {
            // Write the label schemes into tool-db
            const movieLabel = new LabelScheme("Valid1", "#EEE", []);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const validLabel = new LabelScheme("Valid2", "#222", []);
            validLabel.name = (await schemeController.addLabelScheme(validLabel)).name;

            // Write the actual nodes into the customer-db
            const movieNode = new Node("Node1", movieLabel.name, {});
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const validNode = new Node("Node2", validLabel.name, {});
            validNode.nodeId = (await nodesController.createNode(validNode)).nodeId;

            const invalidNode = new Node("invalid", "invalidLabel", {});
            await nodesController.createNode(invalidNode);

            const actual = await nodesController.getAllNodes(100, 0, "", []);
            expect(actual.length).toBe(2);

            delete movieNode.attributes["name"];
            delete validNode.attributes["name"];
            expect(actual.sort(TestUtil.getSortOrder("nodeId"))).toEqual(
                [movieNode, validNode].sort(TestUtil.getSortOrder("nodeId")),
            );
        });

        it("returns one node because node limit is set to 1", async () => {
            // Write the label schemes into tool-db
            const movieLabel = new LabelScheme("Valid1", "#EEE", []);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const validLabel = new LabelScheme("Valid2", "#222", []);
            validLabel.name = (await schemeController.addLabelScheme(validLabel)).name;

            // Write the actual nodes into the customer-db
            const movieNode = new Node("Node1", movieLabel.name, {});
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const validNode = new Node("Node2", validLabel.name, {});
            validNode.nodeId = (await nodesController.createNode(validNode)).nodeId;

            expect((await nodesController.getAllNodes(1, 1, "", [])).length).toBe(1);
        });

        it("returns the node with given search term", async () => {
            // Write the label schemes into tool-db
            const movieLabel = new LabelScheme("Valid1", "#EEE", []);
            movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;

            const validLabel = new LabelScheme("Valid2", "#222", []);
            validLabel.name = (await schemeController.addLabelScheme(validLabel)).name;

            // Write the actual nodes into the customer-db
            const movieNode = new Node("Node1", movieLabel.name, {});
            movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;

            const validNode = new Node("Node2", validLabel.name, {});
            validNode.nodeId = (await nodesController.createNode(validNode)).nodeId;

            expect((await nodesController.getAllNodes(20, 0, "Node1", ["Valid1", "Valid2"])).length).toBe(1);
            expect(await nodesController.getAllNodes(20, 0, "Node1", ["Valid1", "Valid2"])).toEqual([
                {
                    nodeId: movieNode.nodeId,
                    name: movieNode.name,
                    label: movieNode.label,
                    attributes: {},
                },
            ]);
        });
    });

    describe("getRelationsOfNode", () => {
        it("returns all valid relations of the node", async () => {
            // Write the label schemes into tool-db
            const startLabel = new LabelScheme("ValidStartNode", "#EEE", []);
            startLabel.name = (await schemeController.addLabelScheme(startLabel)).name;

            const endLabel = new LabelScheme("ValidEndNode", "#222", []);
            endLabel.name = (await schemeController.addLabelScheme(endLabel)).name;

            const invalidLabel = new LabelScheme("invalidNode", "#222", []);
            invalidLabel.name = (await schemeController.addLabelScheme(invalidLabel)).name;

            // Write the relation-types into tool-db
            const validRelationType = new RelationType(
                "validRel",
                [],
                [new Connection(startLabel.name, endLabel.name)],
            );
            validRelationType.name = (await schemeController.addRelationType(validRelationType)).name;

            // Write the actual nodes into the customer-db
            const sourceNode = new Node("source", startLabel.name, {});
            sourceNode.nodeId = (await nodesController.createNode(sourceNode)).nodeId;

            const targetNode = new Node("target", endLabel.name, {});
            targetNode.nodeId = (await nodesController.createNode(targetNode)).nodeId;

            const invalidNode = new Node("invalid", invalidLabel.name, {});
            invalidNode.nodeId = (await nodesController.createNode(invalidNode)).nodeId;

            // Write the actual relations into customer-db
            const validRelation = new Relation(validRelationType.name, sourceNode.nodeId, targetNode.nodeId, {
                attrOne: "Test",
            });
            validRelation.relationId = (await relationsController.createRelation(validRelation)).relationId;

            // Forcefully write invalid relation into DB
            const invalidRelation = new Relation("invalid", sourceNode.nodeId, invalidNode.nodeId, {
                attrOne: "Test",
            });
            await relationsController.createRelation(invalidRelation);

            const relations: Relation[] = await nodesController.getRelationsOfNode(sourceNode.nodeId);
            // Second relation of the node is not valid -> only one is returned
            expect(relations.length).toEqual(1);
            expect(relations[0].from).toEqual(sourceNode.nodeId);
            expect(relations[0].to).toEqual(targetNode.nodeId);
        });

        // TODO: Fix test
        // it("returns all valid relations of the node with fulltext scheme", async () => {
        //     const movieLabel = new LabelScheme("Movie", "#EEE", [
        //         new NumberAttribute("attrOne", true, 1900),
        //         new StringAttribute("attrTwo", false, "empty"),
        //     ]);
        //     movieLabel.name = (await schemeController.addLabelScheme(movieLabel)).name;
        //
        //     const validLabel = new LabelScheme("validLabel", "#222", [
        //         new NumberAttribute("attrOne", true, 1900),
        //         new StringAttribute("attrTwo", true, "empty"),
        //     ]);
        //     validLabel.name = (await schemeController.addLabelScheme(validLabel)).name;
        //
        //     const nmLabel = new LabelScheme("nmLabel", "#424", [
        //         new NumberAttribute("attrOne", false, null),
        //         new StringAttribute("attrTwo", false, null),
        //         new StringAttribute("attrThree", false, null),
        //     ]);
        //     nmLabel.name = (await schemeController.addLabelScheme(nmLabel)).name;
        //
        //     const movieNode = new Node("Avengers", "Movie", { attrOne: 1990, attrTwo: "GER" });
        //     movieNode.nodeId = (await nodesController.createNode(movieNode)).nodeId;
        //
        //     const validNode = new Node("ValidNode", "validLabel", { attrOne: 1234, attrTwo: "HansPeter" });
        //     validNode.nodeId = (await nodesController.createNode(validNode)).nodeId;
        //
        //     const nmNode = new Node("nmNode", "nmLabel", { attrOne: 42, attrTwo: "GER" });
        //     nmNode.nodeId = (await nodesController.createNode(nmNode)).nodeId;
        //
        //     /**
        //      * Mock relations
        //      */
        //
        //     const hobbitRelation = new RelationType(
        //         "isHobbitOf",
        //         [new StringAttribute("attrOne", false)],
        //         [new Connection(movieLabel.name, validLabel.name)],
        //     );
        //     hobbitRelation.name = (await schemeController.addRelationType(hobbitRelation)).name;
        //
        //     const validRelation = new Relation("isHobbitOf", movieNode.nodeId, validNode.nodeId, {
        //         attrOne: "Gandalf",
        //     });
        //     validRelation.relationId = (await relationsController.createRelation(validRelation)).relationId;
        //
        //     const invalidRelation = new Relation("isHobbitOf", validNode.nodeId, validNode.nodeId, {
        //         attrOne: "Hermione Granger",
        //     });
        //     await relationsController.createRelation(invalidRelation);
        //
        //     await writeFullTextScheme();
        //
        //     const relations: Relation[] = await nodesController.getRelationsOfNode(movieNode.nodeId);
        //
        //     // Second relation of the node is not valid -> only one is returned
        //     expect(relations.length).toEqual(1);
        //     expect(relations[0].from).toEqual(movieNode.nodeId);
        //     expect(relations[0].to).toEqual(validNode.nodeId);
        //
        //     await dropFullTextScheme();
        // });
        //
        // /**
        //  * Write the full text scheme allNodesIndex to test getRelationsOfNode
        //  */
        // async function writeFullTextScheme() {
        //     // language=cypher
        //     const cypher = `
        //   CALL db.index.fulltext.createNodeIndex('allNodesIndex', $labels, $indexedAttrs)
        // `;
        //
        //     const params = {
        //         labels: ["Movie", "validLabel", "nmLabel"],
        //         indexedAttrs: ["nodeId"],
        //     };
        //
        //     return neo4jService.write(cypher, params, process.env.DB_CUSTOMER).catch(databaseUtil.catchDbError);
        // }
        //
        // /**
        //  * Drop the fullTextScheme allNodesIndex
        //  */
        // async function dropFullTextScheme() {
        //     const dropIndex = 'CALL db.index.fulltext.drop("allNodesIndex")';
        //     await neo4jService.write(dropIndex, {}, process.env.DB_CUSTOMER);
        // }
    });
});
