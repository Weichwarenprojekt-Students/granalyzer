import { Test, TestingModule } from "@nestjs/testing";
import { FoldersService } from "./folders.service";
import { Neo4jService } from "nest-neo4j/dist";
import { FoldersRepository } from "./folders.repository";
import MockNeo4jService from "../../test/mock-neo4j.service";
import { FoldersController } from "./folders.controller";
import { UtilsRepository } from "../util/utils.repository";
import { UtilsNode } from "../util/utils.node";
import { DiagramsService } from "../diagrams/diagrams.service";

describe("FoldersController", () => {
    let service: FoldersService;
    let neo4jService: Neo4jService;
    let controller: FoldersController;
    let diagramsService: DiagramsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FoldersController],
            providers: [
                FoldersService,
                DiagramsService,
                {
                    provide: Neo4jService,
                    useValue: MockNeo4jService,
                },
                UtilsNode,
            ],
        }).compile();

        neo4jService = module.get<Neo4jService>(Neo4jService);
        service = module.get<FoldersService>(FoldersService);
        diagramsService = module.get<DiagramsService>(DiagramsService);
        controller = module.get<FoldersController>(FoldersController);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
        expect(diagramsService).toBeDefined();
        expect(neo4jService).toBeDefined();
        expect(controller).toBeDefined();
    });

    describe("getFolders", () => {
        it("should return all folders", async () => {
            jest.spyOn(neo4jService, "read").mockImplementation(() => FoldersRepository.mockGetFolders());

            expect(await controller.getAllFolders()).toStrictEqual(FoldersRepository.resultGetFolders());
        });
    });

    describe("getAllRootElements", () => {
        it("Should return all root folders", async () => {
            jest.spyOn(neo4jService, "read").mockImplementation(() => FoldersRepository.mockGetAllRootFolders());

            expect(await controller.getAllRootFolders()).toStrictEqual(FoldersRepository.resultGetAllRootFolders());
        });
    });

    describe("getFolder", () => {
        it("should return one Folder", async () => {
            // First call checks whether id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Folder"),
            );

            jest.spyOn(neo4jService, "read").mockImplementation(() => FoldersRepository.mockGetFolder());

            expect(await controller.getFolder(0)).toStrictEqual(FoldersRepository.resultGetFolder());
        });
    });

    describe("addFolder", () => {
        it("should return the added Folder", async () => {
            jest.spyOn(neo4jService, "write").mockImplementation(() => FoldersRepository.mockAddFolder());

            expect(await controller.addFolder("added Folder")).toStrictEqual(FoldersRepository.resultAddFolder());
        });
    });

    describe("updateFolder", () => {
        it("should return the updated Folder", async () => {
            // First call checks whether id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Folder"),
            );

            jest.spyOn(neo4jService, "write").mockImplementation(() => FoldersRepository.mockUpdateFolder());

            expect(await controller.updateFolder(0, "update Folder")).toStrictEqual(
                FoldersRepository.resultUpdateFolder(),
            );
        });
    });

    describe("deleteFolder", () => {
        it("should return the deleted Folder", async () => {
            // First call checks whether id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Folder"),
            );

            jest.spyOn(neo4jService, "write").mockImplementation(() => FoldersRepository.mockDeleteFolder());

            expect(await controller.deleteFolder(0)).toStrictEqual(FoldersRepository.resultDeleteFolder());
        });
    });

    describe("getFoldersInFolder", () => {
        it("should return all children of the given folder", async () => {
            // First call checks whether id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Folder"),
            );

            jest.spyOn(neo4jService, "read").mockImplementation(() => FoldersRepository.mockGetFoldersInFolder());

            expect(await controller.getFoldersInFolder(1)).toStrictEqual(FoldersRepository.resultGetFoldersInFolder());
        });
    });

    describe("getFolderInFolder", () => {
        it("should return the child with the given id", async () => {
            // First call checks whether parent id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Folder"),
            );
            // Checks whether child id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Folder"),
            );

            jest.spyOn(neo4jService, "read").mockImplementation(() => FoldersRepository.mockGetFolderInFolder());

            expect(await controller.getFolderInFolder(1, 2)).toStrictEqual(FoldersRepository.resultGetFolderInFolder());
        });
    });

    describe("addFolderToFolder", () => {
        it("should return the added child", async () => {
            // First call checks whether parent id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Folder"),
            );
            // Checks whether child id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Folder"),
            );

            jest.spyOn(neo4jService, "write").mockImplementation(() => FoldersRepository.mockAddFolderToFolder());

            expect(await controller.addFolderToFolder(5, 2)).toStrictEqual(FoldersRepository.resultAddFolderToFolder());
        });
    });

    describe("removeChildFromFolder", () => {
        it("should return the removed child", async () => {
            // First call checks whether parent id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Folder"),
            );
            // Checks whether child id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Folder"),
            );

            jest.spyOn(neo4jService, "write").mockImplementation(() => FoldersRepository.mockRemoveFolderFromFolder());

            expect(await controller.removeFolderFromFolder(5, 2)).toStrictEqual(
                FoldersRepository.resultRemoveFolderFromFolder(),
            );
        });
    });

    describe("getDiagramsInFolder", () => {
        it("should return all diagrams which are inside given folder", async () => {
            // First call checks whether id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Folder"),
            );

            jest.spyOn(neo4jService, "read").mockImplementation(() => FoldersRepository.mockGetDiagramsInFolder());

            expect(await controller.getDiagramsInFolder(1)).toStrictEqual(
                FoldersRepository.resultGetDiagramsInFolder(),
            );
        });
    });

    describe("getDiagramInFolder", () => {
        it("should return the child diagram with the given id", async () => {
            // First call checks whether parent id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Folder"),
            );
            // Checks whether child id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Diagram"),
            );

            jest.spyOn(neo4jService, "read").mockImplementation(() => FoldersRepository.mockGetDiagramInFolder());

            expect(await controller.getDiagramInFolder(1, 2)).toStrictEqual(
                FoldersRepository.resultGetDiagramInFolder(),
            );
        });
    });

    describe("addDiagramToFolder", () => {
        it("should return the added child", async () => {
            // First call checks whether parent id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Folder"),
            );
            // Checks whether child id belongs to a diagram
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Diagram"),
            );

            jest.spyOn(neo4jService, "write").mockImplementation(() => FoldersRepository.mockAddDiagramToFolder());

            expect(await controller.addDiagramToFolder(5, 2)).toStrictEqual(
                FoldersRepository.resultAddDiagramToFolder(),
            );
        });
    });

    describe("removeDiagramFromFolder", () => {
        it("should return the removed child", async () => {
            // First call checks whether parent id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Folder"),
            );
            // Checks whether child id belongs to a diagram
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Diagram"),
            );

            jest.spyOn(neo4jService, "write").mockImplementation(() => FoldersRepository.mockRemoveDiagramFromFolder());

            expect(await controller.removeDiagramFromFolder(5, 2)).toStrictEqual(
                FoldersRepository.resultRemoveDiagramFromFolder(),
            );
        });
    });
});
