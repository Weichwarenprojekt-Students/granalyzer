import { Test, TestingModule } from "@nestjs/testing";
import { DiagramsController } from "./diagrams.controller";
import { DiagramsService } from "./diagrams.service";
import { Neo4jService } from "nest-neo4j/dist";
import { QueryResult, Result, ResultObserver } from "neo4j-driver";

describe("DiagramsController", () => {
    let service: DiagramsService;
    let neo4jService: Neo4jService;
    let controller: DiagramsController;

    const mockResult = (res): Result => {
        return {
            ...new Promise<QueryResult>(res),
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            subscribe(observer: ResultObserver) {
                return;
            },
        };
    };

    beforeEach(async () => {
        const MockNeo4jService = {};

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
        expect(controller).toBeDefined();
    });

    describe("getDiagrams", () => {
        it("should return all diagrams", async () => {
            const mock = mockResult([
                {
                    id: 0,
                    name: "diagram 1",
                },
                {
                    id: 1,
                    name: "diagram 2",
                },
            ]);

            jest.spyOn(neo4jService, "read").mockImplementation(() => mock);

            const result = [
                {
                    id: 0,
                    name: "diagram 1",
                },
                {
                    id: 0,
                    name: "diagram 1",
                },
            ];

            expect(await controller.getAllDiagrams()).toBe(result);
        });
    });
});
