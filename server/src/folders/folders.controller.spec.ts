/**
 * @group db/data-scheme/controller
 */

import { Test, TestingModule } from "@nestjs/testing";
import { Neo4jModule, Neo4jService } from "nest-neo4j/dist";
import { NotFoundException } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { FoldersController } from "./folders.controller";
import { Folder } from "./folder.model";
import { FoldersService } from "./folders.service";
import { Diagram } from "../diagrams/diagram.model";
import { DiagramsService } from "../diagrams/diagrams.service";

describe("FoldersController", () => {
    let module: TestingModule;

    let foldersService: FoldersService;
    let neo4jService: Neo4jService;
    let foldersController: FoldersController;

    let diagram1: Diagram;
    let diagram2: Diagram;
    let diagram3: Diagram;

    let folder1: Folder;
    let folder2: Folder;
    let folder3: Folder;
    let folder4: Folder;

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
            controllers: [FoldersController],
            providers: [FoldersService, DiagramsService],
        }).compile();

        neo4jService = module.get<Neo4jService>(Neo4jService);
        foldersService = module.get<FoldersService>(FoldersService);
        foldersController = module.get<FoldersController>(FoldersController);

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
        folder3 = await addFolder("Folder 3");
        folder4 = await addFolder("Folder 4");
        diagram1 = await addDiagram("Diagram 1");
        diagram2 = await addDiagram("Diagram 2");
        diagram3 = await addDiagram("Diagram 3");

        folder3 = await moveFolderToFolder(folder1["folderId"], folder3["folderId"]);
        folder4 = await moveFolderToFolder(folder1["folderId"], folder4["folderId"]);
        diagram1 = await moveDiagramToFolder(folder1["folderId"], diagram1["diagramId"]);
    });

    afterEach(async () => {
        // language=cypher
        const cypher = "MATCH (a) DETACH DELETE a RETURN a";
        const params = {};

        await neo4jService.write(cypher, params, process.env.DB_TOOL);
    });

    it("should be defined", () => {
        expect(foldersService).toBeDefined();
        expect(neo4jService).toBeDefined();
        expect(foldersController).toBeDefined();
    });

    describe("getAllFolders", () => {
        it("should return all folders", async () => {
            expect((await foldersController.getAllFolders()).sort(getSortOrder("folderId"))).toEqual(
                [folder3, { ...folder1, parentId: null }, { ...folder2, parentId: null }, folder4].sort(
                    getSortOrder("folderId"),
                ),
            );
        });
    });

    describe("getAllRootFolders", () => {
        it("should return all folders in root", async () => {
            expect((await foldersController.getAllRootFolders()).sort()).toEqual([folder1, folder2].sort());
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

    describe("addFolder", () => {
        it("should return one folder", async () => {
            expect((await foldersController.addFolder("Folder 4"))["name"]).toEqual("Folder 4");
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
            await expect(foldersController.getFolder(diagram1["diagramId"])).rejects.toThrowError(NotFoundException);
            await expect(foldersController.getFolder(folder3["folderId"])).rejects.toThrowError(NotFoundException);
        });
    });

    describe("getFoldersInFolder", () => {
        it("should return folders inside of given folder", async () => {
            expect(
                (await foldersController.getFoldersInFolder(folder1["folderId"])).sort(getSortOrder("folderId")),
            ).toEqual([folder3, folder4].sort(getSortOrder("folderId")));
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

    describe("moveFolderToFolder", () => {
        it("should move a folder into another folder", async () => {
            expect(await foldersController.moveFolderToFolder(folder1["folderId"], folder2["folderId"])).toEqual({
                ...folder2,
                parentId: folder1["folderId"],
            });
        });
    });

    describe("addFolderInFolder", () => {
        it("should create a new folder inside of another folder", async () => {
            expect((await foldersController.createFolderInFolder("Folder 4", folder2["folderId"]))["name"]).toEqual(
                "Folder 4",
            );
            expect((await foldersController.getFoldersInFolder(folder2["folderId"]))[0]["name"]).toEqual("Folder 4");
        });
    });

    describe("removeFolderFromFolder", () => {
        it("should remove a folder from another folder", async () => {
            expect(await foldersController.removeFolderFromFolder(folder1["folderId"], folder3["folderId"])).toEqual(
                folder3,
            );
            expect(await foldersController.getFolder(folder3["folderId"])).toEqual({
                folderId: folder3["folderId"],
                name: folder3["name"],
                parentId: null,
            });
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

    function moveFolderToFolder(parentId: string, childId: string): Promise<Folder> {
        //language=Cypher
        const cypher = `
          MATCH (p:Folder), (c:Folder)
            WHERE p.folderId = $parentId AND c.folderId = $childId
          MERGE (c)-[r:IS_CHILD]->(p)
          RETURN c {. *, parentId:p.folderId} AS folder
        `;

        const params = {
            parentId,
            childId,
        };

        return neo4jService
            .write(cypher, params, process.env.DB_TOOL)
            .then((res) => res.records[0].get("folder"))
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

    function getSortOrder(prop) {
        return function (a, b) {
            if (a[prop] > b[prop]) {
                return 1;
            } else if (a[prop] < b[prop]) {
                return -1;
            }
            return 0;
        };
    }
});
