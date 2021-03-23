import { Test, TestingModule } from "@nestjs/testing";
import { DiagramsController } from "./diagrams.controller";
import { DiagramsService } from "./diagrams.service";
import { Neo4jService } from "nest-neo4j/dist";
import Result from "neo4j-driver/types/result";
import ResultSummary from "neo4j-driver/types/result-summary";
import * as neo4j from "neo4j-driver";

describe("DiagramsController", () => {
    let service: DiagramsService;
    let neo4jService: Neo4jService;
    let controller: DiagramsController;

    const mockResult = (res): Result => {
        const mock = {
            records: res.map((row) => ({
                keys: Object.keys(row),
                get: (key: string) => (row.hasOwnProperty(key) ? row[key] : null),
            })),
            summary: <ResultSummary>{},
        };

        return <Result>new Promise((resolve) => {
            resolve(mock);
        });
    };

    beforeEach(async () => {
        const MockNeo4jService = {
            read() {
                return;
            },
        };

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
                    diagram: {
                        identity: neo4j.int(0),
                        properties: {
                            name: "diagram 1",
                        },
                    },
                },
                {
                    diagram: {
                        identity: neo4j.int(1),
                        properties: {
                            name: "diagram 2",
                        },
                    },
                },
            ]);

            jest.spyOn(neo4jService, "read").mockImplementation(() => mock);

            const result = [
                {
                    id: 0,
                    name: "diagram 1",
                },
                {
                    id: 1,
                    name: "diagram 2",
                },
            ];

            expect(await controller.getAllDiagrams()).toStrictEqual(result);
        });
    });
});
