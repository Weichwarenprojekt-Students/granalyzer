/**
 * @group db/data-scheme/controller
 */

import { TestingModule } from "@nestjs/testing";
import { Neo4jService } from "nest-neo4j/dist";
import { NotFoundException } from "@nestjs/common";
import { FoldersController } from "./folders.controller";
import { Folder } from "./folder.model";
import { FoldersService } from "./folders.service";
import { Diagram } from "../diagrams/diagram.model";
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

    let diagram1: Diagram;

    let folder1: Folder;
    let folder2: Folder;
    let folder3: Folder;
    let folder4: Folder;

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

    afterEach(async () => {
        await databaseUtil.clearDatabase();
    });

    it("should be defined", () => {
        expect(foldersService).toBeDefined();
        expect(neo4jService).toBeDefined();
        expect(foldersController).toBeDefined();
        expect(diagramsService).toBeDefined();
    });

    describe("addFolder", () => {
        it("should return one folder", async () => {
            expect((await foldersController.addFolder("Folder 4"))["name"]).toEqual("Folder 4");
        });
    });

    describe("moveFolderToFolder", () => {
        it("should move a folder into another folder", async () => {
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
        beforeEach(async () => {
            folder1 = await foldersService.addFolder("Folder 1");
            folder2 = await foldersService.addFolder("Folder 2");
            folder3 = await foldersService.addFolder("Folder 3");
            folder4 = await foldersService.addFolder("Folder 4");
            diagram1 = await diagramsService.addDiagram("Diagram 1");
            await diagramsService.addDiagram("Diagram 2");
            await diagramsService.addDiagram("Diagram 3");

            folder3 = await foldersService.moveFolderToFolder(folder1["folderId"], folder3["folderId"]);
            folder4 = await foldersService.moveFolderToFolder(folder1["folderId"], folder4["folderId"]);
            diagram1 = await diagramsService.moveDiagramToFolder(folder1["folderId"], diagram1["diagramId"]);
        });

        describe("getAllFolders", () => {
            it("should return all folders", async () => {
                expect((await foldersController.getAllFolders()).sort(TestUtil.getSortOrder("folderId"))).toEqual(
                    [folder3, { ...folder1, parentId: null }, { ...folder2, parentId: null }, folder4].sort(
                        TestUtil.getSortOrder("folderId"),
                    ),
                );
            });
        });

        describe("getAllRootFolders", () => {
            it("should return all folders in root", async () => {
                expect((await foldersController.getAllRootFolders()).sort(TestUtil.getSortOrder("folderId"))).toEqual(
                    [folder1, folder2].sort(TestUtil.getSortOrder("folderId")),
                );
            });
        });

        describe("getFolder", () => {
            it("should return one folder", async () => {
                expect(await foldersController.getFolder(folder1["folderId"])).toEqual({ ...folder1, parentId: null });
            });

            it("non-existing id should return not found exception", async () => {
                await expect(foldersController.getFolder("xxx")).rejects.toThrowError(NotFoundException);
            });
        });

        describe("updateFolder", () => {
            it("should update one folder", async () => {
                expect((await foldersController.updateFolder(folder1["folderId"], "updated folder"))["name"]).toEqual(
                    "updated folder",
                );
                expect((await foldersController.getFolder(folder1["folderId"]))["name"]).toEqual("updated folder");
            });
        });

        describe("deleteFolder", () => {
            it("should delete one folder", async () => {
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
            it("should return folders inside of given folder", async () => {
                expect(
                    (await foldersController.getFoldersInFolder(folder1["folderId"])).sort(
                        TestUtil.getSortOrder("folderId"),
                    ),
                ).toEqual([folder3, folder4].sort(TestUtil.getSortOrder("folderId")));
            });
        });

        describe("getFolderInFolder", () => {
            it("should return folders inside of given folder", async () => {
                expect(await foldersController.getFolderInFolder(folder1["folderId"], folder3["folderId"])).toEqual(
                    folder3,
                );
            });

            it("non-existing id should return not found exception", async () => {
                await expect(foldersController.getFolderInFolder("xxx", "xxx")).rejects.toThrowError(NotFoundException);
            });
        });

        describe("addFolderInFolder", () => {
            it("should create a new folder inside of another folder", async () => {
                expect((await foldersController.createFolderInFolder("Folder 4", folder2["folderId"]))["name"]).toEqual(
                    "Folder 4",
                );
                expect((await foldersController.getFoldersInFolder(folder2["folderId"]))[0]["name"]).toEqual(
                    "Folder 4",
                );
            });
        });

        describe("removeFolderFromFolder", () => {
            it("should remove a folder from another folder", async () => {
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
