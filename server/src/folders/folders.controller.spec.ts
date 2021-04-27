/**
 * @group db/data-scheme/controller
 */

import { TestingModule } from "@nestjs/testing";
import { Neo4jService } from "nest-neo4j/dist";
import { NotFoundException } from "@nestjs/common";
import { FoldersController } from "./folders.controller";
import { Folder } from "./folder.model";
import { FoldersService } from "./folders.service";
import { DiagramsService } from "../diagrams/diagrams.service";
import TestUtil from "../util/test.util";
import { DatabaseUtil } from "../util/database.util";

describe("FoldersController", () => {
    let module: TestingModule;

    let foldersService: FoldersService;
    let neo4jService: Neo4jService;
    let foldersController: FoldersController;
    let databaseUtil: DatabaseUtil;
    let diagramsService: DiagramsService;

    beforeAll(async () => {
        module = await TestUtil.createTestingModule([FoldersService, DiagramsService], [FoldersController]);

        neo4jService = module.get<Neo4jService>(Neo4jService);
        foldersService = module.get<FoldersService>(FoldersService);
        foldersController = module.get<FoldersController>(FoldersController);
        diagramsService = module.get<DiagramsService>(DiagramsService);
        databaseUtil = module.get<DatabaseUtil>(DatabaseUtil);

        // Prepare database
        await databaseUtil.initDatabase();
    });

    beforeEach(async () => {
        await databaseUtil.clearDatabase();
    });

    afterEach(async () => {
        await databaseUtil.clearDatabase();
    });

    it("is defined", () => {
        expect(foldersService).toBeDefined();
        expect(neo4jService).toBeDefined();
        expect(foldersController).toBeDefined();
        expect(databaseUtil).toBeDefined();
        expect(diagramsService).toBeDefined();
    });

    describe("addFolder", () => {
        it("returns one folder", async () => {
            expect((await foldersController.addFolder(new Folder("Folder 4")))["name"]).toEqual("Folder 4");
        });
    });

    describe("moveFolderToFolder", () => {
        it("moves a folder into another folder", async () => {
            const parentFolder = await foldersService.addFolder("parentFolder");
            const childFolder = await foldersService.addFolder("childFolder");
            expect(
                await foldersController.moveFolderToFolder(parentFolder["folderId"], childFolder["folderId"]),
            ).toEqual({
                ...childFolder,
                parentId: parentFolder["folderId"],
            });
        });
    });

    describe("Further tests", () => {
        describe("getAllFolders", () => {
            it("returns all folders", async () => {
                const folder1 = await foldersService.addFolder("Folder 1");
                const folder2 = await foldersService.addFolder("Folder 2");
                let folder3 = await foldersService.addFolder("Folder 3");
                folder3 = await foldersService.moveFolderToFolder(folder1["folderId"], folder3["folderId"]);
                let folder4 = await foldersService.addFolder("Folder 4");
                folder4 = await foldersService.moveFolderToFolder(folder1["folderId"], folder4["folderId"]);
                let diagram1 = await diagramsService.addDiagram("Diagram 1");
                diagram1 = await diagramsService.moveDiagramToFolder(folder1["folderId"], diagram1["diagramId"]);
                await diagramsService.addDiagram("Diagram 2");
                await diagramsService.addDiagram("Diagram 3");

                expect((await foldersController.getAllFolders()).sort(TestUtil.getSortOrder("folderId"))).toEqual(
                    [folder3, { ...folder1, parentId: null }, { ...folder2, parentId: null }, folder4].sort(
                        TestUtil.getSortOrder("folderId"),
                    ),
                );
            });
        });

        describe("getAllRootFolders", () => {
            it("returns all folders in root", async () => {
                const folder1 = await foldersService.addFolder("Folder 1");
                const folder2 = await foldersService.addFolder("Folder 2");
                let folder3 = await foldersService.addFolder("Folder 3");
                folder3 = await foldersService.moveFolderToFolder(folder1["folderId"], folder3["folderId"]);
                let folder4 = await foldersService.addFolder("Folder 4");
                folder4 = await foldersService.moveFolderToFolder(folder1["folderId"], folder4["folderId"]);
                let diagram1 = await diagramsService.addDiagram("Diagram 1");
                diagram1 = await diagramsService.moveDiagramToFolder(folder1["folderId"], diagram1["diagramId"]);
                await diagramsService.addDiagram("Diagram 2");
                await diagramsService.addDiagram("Diagram 3");

                expect((await foldersController.getAllRootFolders()).sort(TestUtil.getSortOrder("folderId"))).toEqual(
                    [folder1, folder2].sort(TestUtil.getSortOrder("folderId")),
                );
            });
        });

        describe("getFolder", () => {
            it("returns one folder", async () => {
                const folder1 = await foldersService.addFolder("Folder 1");
                const folder2 = await foldersService.addFolder("Folder 2");
                let folder3 = await foldersService.addFolder("Folder 3");
                folder3 = await foldersService.moveFolderToFolder(folder1["folderId"], folder3["folderId"]);
                let folder4 = await foldersService.addFolder("Folder 4");
                folder4 = await foldersService.moveFolderToFolder(folder1["folderId"], folder4["folderId"]);
                let diagram1 = await diagramsService.addDiagram("Diagram 1");
                diagram1 = await diagramsService.moveDiagramToFolder(folder1["folderId"], diagram1["diagramId"]);
                await diagramsService.addDiagram("Diagram 2");
                await diagramsService.addDiagram("Diagram 3");

                expect(await foldersController.getFolder(folder1["folderId"])).toEqual({ ...folder1, parentId: null });
            });

            it("throws not found exception due to non-existing id", async () => {
                await expect(foldersController.getFolder("xxx")).rejects.toThrowError(NotFoundException);
            });
        });

        describe("updateFolder", () => {
            it("updates one folder", async () => {
                const folder1 = await foldersService.addFolder("Folder 1");
                const folder2 = await foldersService.addFolder("Folder 2");
                let folder3 = await foldersService.addFolder("Folder 3");
                folder3 = await foldersService.moveFolderToFolder(folder1["folderId"], folder3["folderId"]);
                let folder4 = await foldersService.addFolder("Folder 4");
                folder4 = await foldersService.moveFolderToFolder(folder1["folderId"], folder4["folderId"]);
                let diagram1 = await diagramsService.addDiagram("Diagram 1");
                diagram1 = await diagramsService.moveDiagramToFolder(folder1["folderId"], diagram1["diagramId"]);
                await diagramsService.addDiagram("Diagram 2");
                await diagramsService.addDiagram("Diagram 3");

                expect(
                    (await foldersController.updateFolder(folder1["folderId"], new Folder("updated folder")))["name"],
                ).toEqual("updated folder");
                expect((await foldersController.getFolder(folder1["folderId"]))["name"]).toEqual("updated folder");
            });
        });

        describe("deleteFolder", () => {
            it("deletes one folder", async () => {
                const folder1 = await foldersService.addFolder("Folder 1");
                const folder2 = await foldersService.addFolder("Folder 2");
                let folder3 = await foldersService.addFolder("Folder 3");
                folder3 = await foldersService.moveFolderToFolder(folder1["folderId"], folder3["folderId"]);
                let folder4 = await foldersService.addFolder("Folder 4");
                folder4 = await foldersService.moveFolderToFolder(folder1["folderId"], folder4["folderId"]);
                let diagram1 = await diagramsService.addDiagram("Diagram 1");
                diagram1 = await diagramsService.moveDiagramToFolder(folder1["folderId"], diagram1["diagramId"]);
                await diagramsService.addDiagram("Diagram 2");
                await diagramsService.addDiagram("Diagram 3");

                expect(await foldersController.deleteFolder(folder1["folderId"])).toEqual({
                    ...folder1,
                    parentId: null,
                });
                await expect(foldersController.getFolder(folder1["folderId"])).rejects.toThrowError(NotFoundException);
                await expect(foldersController.getFolder(diagram1["diagramId"])).rejects.toThrowError(
                    NotFoundException,
                );
                await expect(foldersController.getFolder(folder3["folderId"])).rejects.toThrowError(NotFoundException);
            });
        });

        describe("getFoldersInFolder", () => {
            it("returns folders inside of given folder", async () => {
                const folder1 = await foldersService.addFolder("Folder 1");
                const folder2 = await foldersService.addFolder("Folder 2");
                let folder3 = await foldersService.addFolder("Folder 3");
                folder3 = await foldersService.moveFolderToFolder(folder1["folderId"], folder3["folderId"]);
                let folder4 = await foldersService.addFolder("Folder 4");
                folder4 = await foldersService.moveFolderToFolder(folder1["folderId"], folder4["folderId"]);
                let diagram1 = await diagramsService.addDiagram("Diagram 1");
                diagram1 = await diagramsService.moveDiagramToFolder(folder1["folderId"], diagram1["diagramId"]);
                await diagramsService.addDiagram("Diagram 2");
                await diagramsService.addDiagram("Diagram 3");

                expect(
                    (await foldersController.getFoldersInFolder(folder1["folderId"])).sort(
                        TestUtil.getSortOrder("folderId"),
                    ),
                ).toEqual([folder3, folder4].sort(TestUtil.getSortOrder("folderId")));
            });
        });

        describe("getFolderInFolder", () => {
            it("returns folders inside of given folder", async () => {
                const folder1 = await foldersService.addFolder("Folder 1");
                const folder2 = await foldersService.addFolder("Folder 2");
                let folder3 = await foldersService.addFolder("Folder 3");
                folder3 = await foldersService.moveFolderToFolder(folder1["folderId"], folder3["folderId"]);
                let folder4 = await foldersService.addFolder("Folder 4");
                folder4 = await foldersService.moveFolderToFolder(folder1["folderId"], folder4["folderId"]);
                let diagram1 = await diagramsService.addDiagram("Diagram 1");
                diagram1 = await diagramsService.moveDiagramToFolder(folder1["folderId"], diagram1["diagramId"]);
                await diagramsService.addDiagram("Diagram 2");
                await diagramsService.addDiagram("Diagram 3");

                expect(await foldersController.getFolderInFolder(folder1["folderId"], folder3["folderId"])).toEqual(
                    folder3,
                );
            });

            it("throws not found exception due to non-existing id", async () => {
                await expect(foldersController.getFolderInFolder("xxx", "xxx")).rejects.toThrowError(NotFoundException);
            });
        });

        describe("addFolderInFolder", () => {
            it("creates a new folder inside of another folder", async () => {
                const folder1 = await foldersService.addFolder("Folder 1");
                const folder2 = await foldersService.addFolder("Folder 2");
                let folder3 = await foldersService.addFolder("Folder 3");
                folder3 = await foldersService.moveFolderToFolder(folder1["folderId"], folder3["folderId"]);
                let folder4 = await foldersService.addFolder("Folder 4");
                folder4 = await foldersService.moveFolderToFolder(folder1["folderId"], folder4["folderId"]);
                let diagram1 = await diagramsService.addDiagram("Diagram 1");
                diagram1 = await diagramsService.moveDiagramToFolder(folder1["folderId"], diagram1["diagramId"]);
                await diagramsService.addDiagram("Diagram 2");
                await diagramsService.addDiagram("Diagram 3");

                expect(
                    (await foldersController.createFolderInFolder(new Folder("Folder 4"), folder2["folderId"]))["name"],
                ).toEqual("Folder 4");
                expect((await foldersController.getFoldersInFolder(folder2["folderId"]))[0]["name"]).toEqual(
                    "Folder 4",
                );
            });
        });

        describe("removeFolderFromFolder", () => {
            it("removes a folder from another folder", async () => {
                const folder1 = await foldersService.addFolder("Folder 1");
                const folder2 = await foldersService.addFolder("Folder 2");
                let folder3 = await foldersService.addFolder("Folder 3");
                folder3 = await foldersService.moveFolderToFolder(folder1["folderId"], folder3["folderId"]);
                let folder4 = await foldersService.addFolder("Folder 4");
                folder4 = await foldersService.moveFolderToFolder(folder1["folderId"], folder4["folderId"]);
                let diagram1 = await diagramsService.addDiagram("Diagram 1");
                diagram1 = await diagramsService.moveDiagramToFolder(folder1["folderId"], diagram1["diagramId"]);
                await diagramsService.addDiagram("Diagram 2");
                await diagramsService.addDiagram("Diagram 3");

                expect(
                    await foldersController.removeFolderFromFolder(folder1["folderId"], folder3["folderId"]),
                ).toEqual(folder3);
                expect(await foldersController.getFolder(folder3["folderId"])).toEqual({
                    folderId: folder3["folderId"],
                    name: folder3["name"],
                    parentId: null,
                });
            });
        });
    });
});
