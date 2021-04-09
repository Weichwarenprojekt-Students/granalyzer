/**
 * @group db/data-scheme/controller
 */

import { TestingModule } from "@nestjs/testing";
import { Neo4jService } from "nest-neo4j/dist";
import { NotFoundException } from "@nestjs/common";
import { DiagramsService } from "./diagrams.service";
import { DiagramsController } from "./diagrams.controller";
import { Diagram } from "./diagram.model";
import { Folder } from "../folders/folder.model";
import { DatabaseUtil } from "../util/database.util";
import TestUtil from "../util/test.util";
import { FoldersService } from "../folders/folders.service";

describe("DiagramsController", () => {
    let module: TestingModule;

    let diagramsService: DiagramsService;
    let neo4jService: Neo4jService;
    let diagramsController: DiagramsController;
    let databaseUtil: DatabaseUtil;
    let foldersService: FoldersService;

    let diagram1: Diagram;
    let diagram2: Diagram;
    let diagram3: Diagram;

    let folder1: Folder;
    let folder2: Folder;

    beforeAll(async () => {
        module = await TestUtil.createTestingModule([DiagramsService, FoldersService], [DiagramsController]);

        neo4jService = module.get<Neo4jService>(Neo4jService);
        diagramsService = module.get<DiagramsService>(DiagramsService);
        diagramsController = module.get<DiagramsController>(DiagramsController);
        databaseUtil = module.get<DatabaseUtil>(DatabaseUtil);
        foldersService = module.get<FoldersService>(FoldersService);

        await databaseUtil.initDatabase();
    });

    afterEach(async () => {
        await databaseUtil.clearDatabase();
    });

    it("should be defined", () => {
        expect(diagramsService).toBeDefined();
        expect(neo4jService).toBeDefined();
        expect(diagramsController).toBeDefined();
        expect(databaseUtil).toBeDefined();
    });

    describe("addDiagram", () => {
        const bodyObject = {
            name: "Diagram Name",
            serialized: "Serialized",
        };
        it("should return one diagram", async () => {
            expect((await diagramsController.addDiagram(bodyObject))["name"]).toEqual(bodyObject["name"]);
        });

        it("non-existing id should return not found exception", async () => {
            await expect(diagramsController.getDiagram("xxx")).rejects.toThrowError(NotFoundException);
        });
    });

    describe("Further tests", () => {
        beforeEach(async () => {
            folder1 = await foldersService.addFolder("Folder 1");
            folder2 = await foldersService.addFolder("Folder 2");
            diagram1 = await diagramsService.addDiagram("Diagram 1");
            diagram2 = await diagramsService.addDiagram("Diagram 2");
            diagram3 = await diagramsService.addDiagram("Diagram 3");

            diagram1 = await diagramsService.moveDiagramToFolder(folder1["folderId"], diagram1["diagramId"]);
        });

        describe("getDiagrams", () => {
            it("should return all diagrams", async () => {
                expect((await diagramsController.getAllDiagrams()).sort(TestUtil.getSortOrder("diagramId"))).toEqual(
                    [diagram1, { ...diagram2, parentId: null }, { ...diagram3, parentId: null }].sort(
                        TestUtil.getSortOrder("diagramId"),
                    ),
                );
            });
        });

        describe("getAllRootDiagrams", () => {
            it("should return all diagrams in root", async () => {
                expect(
                    (await diagramsController.getAllRootDiagrams()).sort(TestUtil.getSortOrder("diagramId")),
                ).toEqual([diagram2, diagram3].sort(TestUtil.getSortOrder("diagramId")));
            });
        });

        describe("getDiagram", () => {
            it("should return one diagram", async () => {
                expect(await diagramsController.getDiagram(diagram2["diagramId"])).toEqual({
                    ...diagram2,
                    parentId: null,
                });
            });

            it("non-existing id should return not found exception", async () => {
                await expect(diagramsController.getDiagram("xxx")).rejects.toThrowError(NotFoundException);
            });
        });

        describe("updateDiagram", () => {
            const bodyObject = {
                name: "changed name",
                serialized: ",changed string",
            };
            it("should return the updated diagram", async () => {
                expect(await diagramsController.updateDiagram(diagram2["diagramId"], bodyObject)).toEqual({
                    diagramId: diagram2["diagramId"],
                    ...bodyObject,
                    parentId: null,
                });
            });
            it("non-existing id should return not found exception", async () => {
                await expect(diagramsController.updateDiagram("xxx", bodyObject)).rejects.toThrowError(
                    NotFoundException,
                );
            });
        });

        describe("deleteDiagram", () => {
            it("should delete one diagram", async () => {
                expect(await diagramsController.deleteDiagram(diagram2["diagramId"])).toEqual({
                    ...diagram2,
                    parentId: null,
                });
                await expect(diagramsController.getDiagram(diagram2["diagramId"])).rejects.toThrowError(
                    NotFoundException,
                );
            });

            it("non-existing id should return not found exception", async () => {
                await expect(diagramsController.deleteDiagram("xxx")).rejects.toThrowError(NotFoundException);
            });
        });
    });
});
