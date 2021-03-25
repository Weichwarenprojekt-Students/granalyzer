import { Test, TestingModule } from "@nestjs/testing";
import { FoldersService } from "./folders.service";
import { Neo4jService } from "nest-neo4j/dist";
import { FoldersRepository } from "./folders.repository";
import MockNeo4jService from "../../test/mock-neo4j.service";
import { FoldersController } from "./folders.controller";
import { UtilsRepository } from "../util/utils.repository";
import { NotAcceptableException } from "@nestjs/common";
import { UtilsNode } from "../util/utils.node";

describe("FoldersController", () => {
    let service: FoldersService;
    let neo4jService: Neo4jService;
    let controller: FoldersController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FoldersController],
            providers: [
                FoldersService,
                {
                    provide: Neo4jService,
                    useValue: MockNeo4jService,
                },
                UtilsNode,
            ],
        }).compile();

        neo4jService = module.get<Neo4jService>(Neo4jService);
        service = module.get<FoldersService>(FoldersService);
        controller = module.get<FoldersController>(FoldersController);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
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
        it("Should return all diagrams and folders", async () => {
            jest.spyOn(neo4jService, "read").mockImplementation(() => FoldersRepository.mockGetAllRootElements());

            expect(await controller.getAllRootElements()).toStrictEqual(FoldersRepository.resultGetAllRootElements());
        })
    })

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

    describe("getChildrenOfFolder", () => {
        it("should return all children of the given folder", async () => {
            // First call checks whether id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Folder"),
            );

            jest.spyOn(neo4jService, "read").mockImplementation(() => FoldersRepository.mockGetChildrenOfFolder());

            expect(await controller.getChildrenOfFolder(1)).toStrictEqual(
                FoldersRepository.resultGetChildrenOfFolder(),
            );
        });
    });

    describe("getChildOfFolder", () => {
        it("should return the child with the given id", async () => {
            // First call checks whether id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Folder"),
            );

            jest.spyOn(neo4jService, "read").mockImplementation(() => FoldersRepository.mockGetChildOfFolder());

            expect(await controller.getChildOfFolder(1, 2)).toStrictEqual(FoldersRepository.resultGetChildOfFolder());
        });
    });

    describe("addChildToFolder", () => {
        it("should return the added child", async () => {
            // First call checks child and parent are allowed types
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                FoldersRepository.mockValidateParentAndChildById(),
            );

            jest.spyOn(neo4jService, "write").mockImplementation(() => FoldersRepository.mockAddChildToFolder());

            expect(await controller.addChildToFolder(5, 2)).toStrictEqual(FoldersRepository.resultAddChildToFolder());
        });

        it("should return not acceptable exception", async () => {
            // First call checks child and parent are allowed types
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                FoldersRepository.mockValidateParentAndChildByIdError(),
            );

            await expect(controller.addChildToFolder(5, 2)).rejects.toThrowError(NotAcceptableException);
        });
    });

    describe("removeChildFromFolder", () => {
        it("should return the removed child", async () => {
            // First call checks whether id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() =>
                UtilsRepository.mockCheckElementForLabel("Folder"),
            );

            jest.spyOn(neo4jService, "write").mockImplementation(() => FoldersRepository.mockRemoveChildFromFolder());

            expect(await controller.removeChildFromFolder(5, 2)).toStrictEqual(
                FoldersRepository.resultRemoveChildFromFolder(),
            );
        });
    });
});
