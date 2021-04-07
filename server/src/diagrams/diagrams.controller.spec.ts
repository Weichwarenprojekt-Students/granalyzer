/**
 * @group db/data-scheme/controller
 */

import { Test, TestingModule } from "@nestjs/testing";
import { Neo4jModule, Neo4jService } from "nest-neo4j/dist";
import { NotFoundException } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DiagramsService } from "./diagrams.service";
import { DiagramsController } from "./diagrams.controller";
import { Diagram } from "./diagram.model";
import { Folder } from "../folders/folder.model";

describe("DiagramsController", () => {
    let module: TestingModule;

    let diagramsService: DiagramsService;
    let neo4jService: Neo4jService;
    let diagramsController: DiagramsController;

    let diagram1: Diagram;
    let diagram2: Diagram;
    let diagram3: Diagram;

    let folder1: Folder;
    let folder2: Folder;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot(),
                Neo4jModule.forRoot({
                    scheme: "bolt",
                    host: process.env.DB_HOST,
                    port: process.env.DB_PORT,
                    username: process.env.DB_USERNAME,
                    password: process.env.DB_PASSWORD,
                }),
            ],
            controllers: [DiagramsController],
            providers: [DiagramsService],
        }).compile();

        neo4jService = module.get<Neo4jService>(Neo4jService);
        diagramsService = module.get<DiagramsService>(DiagramsService);
        diagramsController = module.get<DiagramsController>(DiagramsController);

        // language=cypher
        await neo4jService.write(`CREATE DATABASE ${process.env.DB_TOOL} IF NOT exists`).catch(console.error);
        // language=cypher
        await neo4jService.write(`CREATE DATABASE ${process.env.DB_CUSTOMER} IF NOT exists`).catch(console.error);

        const setupFolderKey = `
            CREATE CONSTRAINT FolderKey IF NOT EXISTS
            ON (f:Folder) 
            ASSERT (f.folderId) IS NODE KEY
        `;
        const setupDiagramKey = `
            CREATE CONSTRAINT DiagramKey IF NOT EXISTS
            ON (d:Diagram)
            ASSERT (d.diagramId) IS NODE KEY
            `;
        await neo4jService.write(setupFolderKey, {}, process.env.DB_TOOL);
        await neo4jService.write(setupDiagramKey, {}, process.env.DB_TOOL);
        // language=cypher
        await neo4jService.write("MATCH (a) DETACH DELETE a RETURN a", {}, process.env.DB_TOOL);
    });

    beforeEach(async () => {
        folder1 = await addFolder("Folder 1");
        folder2 = await addFolder("Folder 2");
        diagram1 = await addDiagram("Diagram 1");
        diagram2 = await addDiagram("Diagram 2");
        diagram3 = await addDiagram("Diagram 3");

        diagram1 = await moveDiagramToFolder(folder1["folderId"], diagram1["diagramId"]);
    });

    afterEach(async () => {
        // language=cypher
        const cypher = "MATCH (a) DETACH DELETE a RETURN a";
        const params = {};

        await neo4jService.write(cypher, params, process.env.DB_TOOL);
    });

    it("should be defined", () => {
        expect(diagramsService).toBeDefined();
        expect(neo4jService).toBeDefined();
        expect(diagramsController).toBeDefined();
    });

    describe("getDiagrams", () => {
        it("should return all diagrams", async () => {
            expect((await diagramsController.getAllDiagrams()).sort()).toEqual(
                [diagram1, { ...diagram2, parentId: null }, { ...diagram3, parentId: null }].sort(),
            );
        });
    });

    describe("getAllRootDiagrams", () => {
        it("should return all diagrams in root", async () => {
            expect((await diagramsController.getAllRootDiagrams()).sort()).toEqual([diagram2, diagram3].sort());
        });
    });

    describe("getDiagram", () => {
        it("should return one diagram", async () => {
            expect(await diagramsController.getDiagram(diagram2["diagramId"])).toEqual({ ...diagram2, parentId: null });
        });

        it("non-existing id should return not found exception", async () => {
            await expect(diagramsController.getDiagram("xxx")).rejects.toThrowError(NotFoundException);
        });
    });

    describe("addDiagram", () => {
        it("should return one diagram", async () => {
            expect((await diagramsController.addDiagram("Diagram 4"))["name"]).toEqual("Diagram 4");
        });

        it("non-existing id should return not found exception", async () => {
            await expect(diagramsController.getDiagram("xxx")).rejects.toThrowError(NotFoundException);
            const bodyObject = {
                name: "my name",
                serialized: "string",
            };

            expect(await controller.addDiagram(bodyObject)).toStrictEqual(DiagramsRepository.resultAddDiagram());
        });
    });

    describe("updateDiagram", () => {
        it("should return one diagram", async () => {
            expect((await diagramsController.updateDiagram(diagram2["diagramId"], "updated diagram"))["name"]).toEqual(
                "updated diagram",
            );
        });

        it("non-existing id should return not found exception", async () => {
            await expect(diagramsController.updateDiagram("xxx", "updatedDiagram")).rejects.toThrowError(
                NotFoundException,
            const bodyObject = {
                name: "changed name",
                serialized: ",changed string",
            };

            expect(await controller.updateDiagram(0, bodyObject)).toStrictEqual(
            );
        });
    });

    describe("deleteDiagram", () => {
        it("should delete one diagram", async () => {
            expect(await diagramsController.deleteDiagram(diagram2["diagramId"])).toEqual({
                ...diagram2,
                parentId: null,
            });
            await expect(diagramsController.getDiagram(diagram2["diagramId"])).rejects.toThrowError(NotFoundException);
        });

        it("non-existing id should return not found exception", async () => {
            await expect(diagramsController.deleteDiagram("xxx")).rejects.toThrowError(NotFoundException);
        });
    });

    function addDiagram(name: string): Promise<Diagram> {
        // language=Cypher
        const cypher = `
          CREATE (d:Diagram {name: $name, diagramId: apoc.create.uuid()})
          RETURN d {. *} AS diagram
        `;

        const params = {
            name,
        };

        return neo4jService.write(cypher, params, process.env.DB_TOOL).then((res) => res.records[0].get("diagram"));
    }

    function addFolder(name: string): Promise<Folder> {
        // language=Cypher
        const cypher = `
          CREATE (f:Folder {name: $name, folderId: apoc.create.uuid()})
          RETURN f {. *} AS folder
        `;

        const params = {
            name,
        };

        return neo4jService.write(cypher, params, process.env.DB_TOOL).then((res) => res.records[0].get("folder"));
    }

    function moveDiagramToFolder(parentId: string, childId: string): Promise<Diagram> {
        //language=Cypher
        const cypher = `
          MATCH (p:Folder), (c:Diagram)
            WHERE p.folderId = $parentId AND c.diagramId = $childId
          MERGE (c)-[r:IS_CHILD]->(p)
          RETURN c {. *, parentId:p.folderId} AS diagram
        `;

        const params = {
            parentId,
            childId,
        };

        return neo4jService
            .write(cypher, params, process.env.DB_TOOL)
            .then((res) => res.records[0].get("diagram"))
            .catch(() => {
                throw new NotFoundException();
            });
    }

    function getDiagramWithId(id: string): Promise<Diagram> {
        // language=Cypher
        const cypher = `
          MATCH (d:Diagram {diagramId: $id})
          OPTIONAL MATCH (d)-[:IS_CHILD]->(f:Folder)
          RETURN d {. *, parentId:f.folderId} AS diagram
        `;

        const params = {
            id,
        };

        return neo4jService
            .read(cypher, params, process.env.DB_TOOL)
            .then((res) => res.records[0].get("diagram"))
            .catch(() => {
                throw new NotFoundException("The diagram has not been found");
            });
    }
});
