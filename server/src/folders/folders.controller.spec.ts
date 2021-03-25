import { Test, TestingModule } from "@nestjs/testing";
import { FoldersService } from "./folders.service";
import { Neo4jService } from "nest-neo4j/dist";
import { FoldersRepository } from "./folders.repository";
import MockNeo4jService from "../../test/mock-neo4j.service";
import { NotAcceptableException, NotFoundException } from "@nestjs/common";
import { FoldersController } from "./folders.controller";

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

            expect(await controller.getAllRootFolders()).toStrictEqual(FoldersRepository.resultGetFolders());
        });
    });

    describe("getFolder", () => {
        it("should return one Folder", async () => {
            // First call checks whether id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() => FoldersRepository.mockIsFolder());

            jest.spyOn(neo4jService, "read").mockImplementation(() => FoldersRepository.mockGetFolder());

            expect(await controller.getFolder(0)).toStrictEqual(FoldersRepository.resultGetFolder());
        });

        it("should return not acceptable exception", async () => {
            // First call checks whether id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() => FoldersRepository.mockIsNotFolder());

            await expect(controller.getFolder(2)).rejects.toThrowError(NotAcceptableException);
        });

        it("should return not found exception", async () => {
            // First call checks whether id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() => FoldersRepository.mockIsFolder());

            jest.spyOn(neo4jService, "read").mockImplementation(() => FoldersRepository.mockEmptyResponse());

            await expect(controller.getFolder(2)).rejects.toThrowError(NotFoundException);
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
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() => FoldersRepository.mockIsFolder());

            jest.spyOn(neo4jService, "write").mockImplementation(() => FoldersRepository.mockUpdateFolder());

            expect(await controller.updateFolder(0, "update Folder")).toStrictEqual(
                FoldersRepository.resultUpdateFolder(),
            );
        });

        it("should return not found exception", async () => {
            // First call checks whether id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() => FoldersRepository.mockIsFolder());

            jest.spyOn(neo4jService, "write").mockImplementation(() => FoldersRepository.mockEmptyResponse());

            await expect(controller.updateFolder(2, "update Folder")).rejects.toThrowError(NotFoundException);
        });
    });

    describe("deleteFolder", () => {
        it("should return the deleted Folder", async () => {
            // First call checks whether id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() => FoldersRepository.mockIsFolder());

            jest.spyOn(neo4jService, "write").mockImplementation(() => FoldersRepository.mockDeleteFolder());

            expect(await controller.deleteFolder(0)).toStrictEqual(FoldersRepository.resultDeleteFolder());
        });

        it("should return not found exception", async () => {
            // First call checks whether id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() => FoldersRepository.mockIsFolder());

            jest.spyOn(neo4jService, "write").mockImplementation(() => FoldersRepository.mockEmptyResponse());

            await expect(controller.deleteFolder(2)).rejects.toThrowError(NotFoundException);
        });
    });

    describe("getChildrenOfFolder", () => {
        it("should return all children of the given folder", async () => {
            // First call checks whether id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() => FoldersRepository.mockIsFolder());

            jest.spyOn(neo4jService, "read").mockImplementation(() => FoldersRepository.mockGetChildrenOfFolder());

            expect(await controller.getChildrenOfFolder(1)).toStrictEqual(
                FoldersRepository.resultGetChildrenOfFolder(),
            );
        });
    });

    describe("getChildOfFolder", () => {
        it("should return the child with the given id", async () => {
            // First call checks whether id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() => FoldersRepository.mockIsFolder());

            jest.spyOn(neo4jService, "read").mockImplementation(() => FoldersRepository.mockGetChildOfFolder());

            expect(await controller.getChildOfFolder(1, 2)).toStrictEqual(FoldersRepository.resultGetChildOfFolder());
        });

        it("should return not found exception", async () => {
            // First call checks whether id belongs to a folder
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() => FoldersRepository.mockIsFolder());

            jest.spyOn(neo4jService, "read").mockImplementation(() => FoldersRepository.mockEmptyResponse());

            await expect(controller.getChildOfFolder(1, 3)).rejects.toThrowError(NotFoundException);
        });

        it("should return not acceptable exception", async () => {
            jest.spyOn(neo4jService, "read").mockImplementation(() => FoldersRepository.mockEmptyResponse());

            await expect(controller.getChildOfFolder(1, 3)).rejects.toThrowError(NotAcceptableException);
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
            jest.spyOn(neo4jService, "read").mockImplementationOnce(() => FoldersRepository.mockIsFolder());

            jest.spyOn(neo4jService, "write").mockImplementation(() => FoldersRepository.mockRemoveChildFromFolder());

            expect(await controller.removeChildFromFolder(5, 2)).toStrictEqual(
                FoldersRepository.resultRemoveChildFromFolder(),
            );
        });
    });
});
