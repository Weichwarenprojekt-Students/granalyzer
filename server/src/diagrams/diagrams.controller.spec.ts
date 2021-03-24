import { Test, TestingModule } from "@nestjs/testing";
import { DiagramsController } from "./diagrams.controller";
import { DiagramsService } from "./diagrams.service";
import { Neo4jService } from "nest-neo4j/dist";
import { DiagramsRepository } from "./diagrams.repository";
import MockNeo4jService from "../../test/mock-neo4j.service";

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
});
