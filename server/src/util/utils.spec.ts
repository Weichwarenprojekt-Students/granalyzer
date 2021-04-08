/**
 * @group unit/utils
 */

import { DatabaseUtil } from "./database.util";
import { Test, TestingModule } from "@nestjs/testing";
import { Neo4jService } from "nest-neo4j/dist";
import MockNeo4jService from "../../test/mock-neo4j.service";
import { UtilsRepository } from "./utils.repository";
import { NotAcceptableException, NotFoundException } from "@nestjs/common";

describe("NodeUtils", () => {
    let utilsNode: DatabaseUtil;
    let neo4jService: Neo4jService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: Neo4jService,
                    useValue: MockNeo4jService,
                },
                DatabaseUtil,
            ],
        }).compile();

        neo4jService = module.get<Neo4jService>(Neo4jService);
        utilsNode = module.get<DatabaseUtil>(DatabaseUtil);
    });

    it("should be defined", () => {
        expect(utilsNode).toBeDefined();
        expect(neo4jService).toBeDefined();
    });

    describe("hasLabel", () => {
        it("Should not throw an exception ", async () => {
            jest.spyOn(neo4jService, "read").mockImplementation(() =>
                UtilsRepository.mockCheckElementForLabel("Label"),
            );

            expect(await utilsNode.checkElementForLabel(1, "Label"));
        });

        it("Should throw NotAcceptableException", async () => {
            jest.spyOn(neo4jService, "read").mockImplementation(() => UtilsRepository.mockCheckElementForLabelNAE());

            await expect(utilsNode.checkElementForLabel(1, "Label")).rejects.toThrowError(NotAcceptableException);
        });

        it("Should throw NotFoundException", async () => {
            jest.spyOn(neo4jService, "read").mockImplementation(() => UtilsRepository.mockCheckElementForLabelNFE());

            await expect(utilsNode.checkElementForLabel(4, "Label")).rejects.toThrowError(NotFoundException);
        });
    });
});
