/**
 * @group db/data-scheme/controller
 */

import { TestingModule } from "@nestjs/testing";
import { Neo4jService } from "nest-neo4j/dist";
import { NotFoundException } from "@nestjs/common";
import { DiagramsService } from "./diagrams.service";
import { DiagramsController } from "./diagrams.controller";
import { Diagram } from "./diagram.model";
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

    it("is defined", () => {
        expect(diagramsService).toBeDefined();
        expect(neo4jService).toBeDefined();
        expect(diagramsController).toBeDefined();
        expect(databaseUtil).toBeDefined();
        expect(foldersService).toBeDefined();
    });

    describe("addDiagram", () => {
        it("returns one diagram", async () => {
            const bodyObject = new Diagram("Diagram Name", "Serialized");
            expect((await diagramsController.addDiagram(bodyObject))["name"]).toEqual(bodyObject["name"]);
        });

        it("throws not found exception due to non-existing id ", async () => {
            await expect(diagramsController.getDiagram("xxx")).rejects.toThrowError(NotFoundException);
        });
    });

    describe("Further tests", () => {
        describe("getDiagrams", () => {
            it("returns all diagrams", async () => {
                const folder1 = await foldersService.addFolder("Folder 1");
                let diagram1 = await diagramsService.addDiagram("Diagram 1");
                diagram1 = await diagramsService.moveDiagramToFolder(folder1["folderId"], diagram1["diagramId"]);
                const diagram2 = await diagramsService.addDiagram("Diagram 2");
                const diagram3 = await diagramsService.addDiagram("Diagram 3");

                expect((await diagramsController.getAllDiagrams()).sort(TestUtil.getSortOrder("diagramId"))).toEqual(
                    [diagram1, { ...diagram2, parentId: null }, { ...diagram3, parentId: null }].sort(
                        TestUtil.getSortOrder("diagramId"),
                    ),
                );
            });
        });

        describe("getAllRootDiagrams", () => {
            it("returns all diagrams in root", async () => {
                const folder1 = await foldersService.addFolder("Folder 1");
                let diagram1 = await diagramsService.addDiagram("Diagram 1");
                diagram1 = await diagramsService.moveDiagramToFolder(folder1["folderId"], diagram1["diagramId"]);
                const diagram2 = await diagramsService.addDiagram("Diagram 2");
                const diagram3 = await diagramsService.addDiagram("Diagram 3");

                expect(
                    (await diagramsController.getAllRootDiagrams()).sort(TestUtil.getSortOrder("diagramId")),
                ).toEqual([diagram2, diagram3].sort(TestUtil.getSortOrder("diagramId")));
            });
        });

        describe("getDiagram", () => {
            it("returns one diagram", async () => {
                const diagram2 = await diagramsService.addDiagram("Diagram 2");
                expect(await diagramsController.getDiagram(diagram2["diagramId"])).toEqual({
                    ...diagram2,
                    parentId: null,
                });
            });

            it("throws not found exception due to non-existing id ", async () => {
                await expect(diagramsController.getDiagram("xxx")).rejects.toThrowError(NotFoundException);
            });
        });

        describe("updateDiagram", () => {
            it("returns the updated diagram", async () => {
                const bodyObject = new Diagram("changed name", ",changed string");
                const diagram2 = await diagramsService.addDiagram("Diagram 2");

                expect(await diagramsController.updateDiagram(diagram2["diagramId"], bodyObject)).toEqual({
                    diagramId: diagram2["diagramId"],
                    ...bodyObject,
                    parentId: null,
                });
            });
            it("throws not found exception due to non-existing id ", async () => {
                const bodyObject = new Diagram("changed name", ",changed string");
                await expect(diagramsController.updateDiagram("xxx", bodyObject)).rejects.toThrowError(
                    NotFoundException,
                );
            });
        });

        describe("deleteDiagram", () => {
            it("deletes one diagram", async () => {
                const diagram2 = await diagramsService.addDiagram("Diagram 2");
                expect(await diagramsController.deleteDiagram(diagram2["diagramId"])).toEqual({
                    ...diagram2,
                    parentId: null,
                });
                await expect(diagramsController.getDiagram(diagram2["diagramId"])).rejects.toThrowError(
                    NotFoundException,
                );
            });

            it("throws not found exception due to non-existing id", async () => {
                await expect(diagramsController.deleteDiagram("xxx")).rejects.toThrowError(NotFoundException);
            });
        });
    });
});
