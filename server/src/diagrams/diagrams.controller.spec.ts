import { Test, TestingModule } from "@nestjs/testing";
import { DiagramsController } from "./diagrams.controller";
import { DiagramsService } from "./diagrams.service";
import { Neo4jService } from "nest-neo4j/dist";
import { DiagramsRepository } from "./diagrams.repository";
import MockNeo4jService from "../../test/mock-neo4j.service";
import { NotFoundException } from "@nestjs/common";

describe("DiagramsController", () => {
    let service: DiagramsService;
    let neo4jService: Neo4jService;
    let controller: DiagramsController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DiagramsController],
            providers: [
                DiagramsService,
                {
                    provide: Neo4jService,
                    useValue: MockNeo4jService,
                },
            ],
        }).compile();

        neo4jService = module.get<Neo4jService>(Neo4jService);
        service = module.get<DiagramsService>(DiagramsService);
        controller = module.get<DiagramsController>(DiagramsController);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
        expect(neo4jService).toBeDefined();
        expect(controller).toBeDefined();
    });

    describe("getDiagrams", () => {
        it("should return all diagrams", async () => {
            jest.spyOn(neo4jService, "read").mockImplementation(() => DiagramsRepository.mockGetDiagrams());

            expect(await controller.getAllDiagrams()).toStrictEqual(DiagramsRepository.resultGetDiagrams());
        });
    });

    describe("getDiagram", () => {
        it("should return one diagram", async () => {
            jest.spyOn(neo4jService, "read").mockImplementation(() => DiagramsRepository.mockGetDiagram());

            expect(await controller.getDiagram(0)).toStrictEqual(DiagramsRepository.resultGetDiagram());
        });

        it("should return not found exception", async () => {
            jest.spyOn(neo4jService, "read").mockImplementation(() => DiagramsRepository.mockEmptyResponse());

            await expect(controller.getDiagram(2)).rejects.toThrowError(NotFoundException);
        });
    });

    describe("addDiagram", () => {
        it("should return the added diagram", async () => {
            jest.spyOn(neo4jService, "write").mockImplementation(() => DiagramsRepository.mockAddDiagram());

            expect(await controller.addDiagram("added diagram")).toStrictEqual(DiagramsRepository.resultAddDiagram());
        });
    });

    describe("updateDiagram", () => {
        it("should return the updated diagram", async () => {
            jest.spyOn(neo4jService, "write").mockImplementation(() => DiagramsRepository.mockUpdateDiagram());

            expect(await controller.updateDiagram(0, "update diagram")).toStrictEqual(
                DiagramsRepository.resultUpdateDiagram(),
            );
        });

        it("should return not found exception", async () => {
            jest.spyOn(neo4jService, "write").mockImplementation(() => DiagramsRepository.mockEmptyResponse());

            await expect(controller.updateDiagram(2, "update diagram")).rejects.toThrowError(NotFoundException);
        });
    });

    describe("deleteDiagram", () => {
        it("should return the deleted diagram", async () => {
            jest.spyOn(neo4jService, "write").mockImplementation(() => DiagramsRepository.mockDeleteDiagram());

            expect(await controller.deleteDiagram(0)).toStrictEqual(DiagramsRepository.resultDeleteDiagram());
        });

        it("should return not found exception", async () => {
            jest.spyOn(neo4jService, "write").mockImplementation(() => DiagramsRepository.mockEmptyResponse());

            await expect(controller.deleteDiagram(2)).rejects.toThrowError(NotFoundException);
        });
    });
});
