/**
 * @group db/nodes/controller
 */

import { Test, TestingModule } from "@nestjs/testing";
import { NodesController } from "./nodes.controller";
import { Neo4jModule, Neo4jService } from "nest-neo4j/dist";
import { NodesService } from "./nodes.service";
import Node from "./node.model";
import * as dotenv from "dotenv";
import { Label } from "../data-scheme/models/label";
import { NumberAttribute, StringAttribute } from "../data-scheme/models/attributes";
import { UtilModule } from "../util/util.module";
import { InternalServerErrorException } from "@nestjs/common";
import Relation from "../relations/relation.model";
import { RelationType } from "../data-scheme/models/relationType";
import { Connection } from "../data-scheme/models/connection";
import { NodesRelationsService } from "./nodes-relations.service";

describe("NodesController", () => {
    let module: TestingModule;

    let service: NodesService;
    let neo4jService: Neo4jService;
    let controller: NodesController;

    let movieNodeId;
    let validNodeId;
    let nmNodeID;

    beforeAll(async () => {
        // Get .env variables
        dotenv.config();

        module = await Test.createTestingModule({
            imports: [
                Neo4jModule.forRoot({
                    scheme: "bolt",
                    host: process.env.DB_HOST,
                    port: process.env.DB_PORT,
                    username: process.env.DB_USERNAME,
                    password: process.env.DB_PASSWORD,
                }),
                UtilModule.forRoot(),
            ],
            controllers: [NodesController],
            providers: [NodesService, NodesRelationsService],
        }).compile();

        controller = module.get<NodesController>(NodesController);
        service = module.get<NodesService>(NodesService);
        neo4jService = module.get<Neo4jService>(Neo4jService);

        // language=cypher
        await neo4jService.write(`CREATE DATABASE ${process.env.DB_TOOL} IF NOT exists`).catch(console.error);
        // language=cypher
        await neo4jService.write(`CREATE DATABASE ${process.env.DB_CUSTOMER} IF NOT exists`).catch(console.error);

        // language=cypher
        const cypher = "MATCH (n) DETACH DELETE n RETURN n";

        await neo4jService.write(cypher, {}, process.env.DB_TOOL);
        await neo4jService.write(cypher, {}, process.env.DB_CUSTOMER);
    });

    beforeEach(async () => {
        const movieLabel = new Label("Movie", "#EEE", [
            new NumberAttribute("attrOne", true, 1900),
            new StringAttribute("attrTwo", false, "empty"),
        ]);
        movieLabel.id = await writeLabel(movieLabel);

        const validLabel = new Label("validLabel", "#222", [
            new NumberAttribute("attrOne", true, 1900),
            new StringAttribute("attrTwo", true, "empty"),
        ]);
        validLabel.id = await writeLabel(validLabel);

        const nmLabel = new Label("nmLabel", "#424", [
            new NumberAttribute("attrOne", false, null),
            new StringAttribute("attrTwo", false, null),
            new StringAttribute("attrThree", false, null),
        ]);
        nmLabel.id = await writeLabel(nmLabel);

        const movieNode = new Node("Avengers", "Movie", { attrOne: 1990, attrTwo: "GER" });
        movieNode.id = await writeNode(movieNode);
        movieNodeId = movieNode.id;

        const validNode = new Node("ValidNode", "validLabel", { attrOne: 1234, attrTwo: "HansPeter" });
        validNode.id = await writeNode(validNode);
        validNodeId = validNode.id;

        const nmNode = new Node("nmNode", "nmLabel", { attrOne: 42, attrTwo: "GER" });
        nmNode.id = await writeNode(nmNode);
        nmNodeID = nmNode.id;

        /**
         * Mock relations
         */

        const hobbitRelation = new RelationType(
            "isHobbitOf",
            [new StringAttribute("attrOne", false)],
            [new Connection(movieLabel.name, validLabel.name)],
        );
        hobbitRelation.id = await writeRelationType(hobbitRelation);

        const validRelation = new Relation("isHobbitOf", movieNode.id, validNode.id, { attrOne: "Gandalf" });
        validRelation.id = await writeRelation(validRelation);
    });

    afterEach(async () => {
        // language=cypher
        const cypher = "MATCH (n) DETACH DELETE n RETURN n";

        await neo4jService.write(cypher, {}, process.env.DB_TOOL);
        await neo4jService.write(cypher, {}, process.env.DB_CUSTOMER);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
        expect(service).toBeDefined();
        expect(neo4jService).toBeDefined();
    });

    describe("getNode", () => {
        it("should get one node", async () => {
            expect((await controller.getNode(movieNodeId)).name).toBe("Avengers");
        });

        it("should throw an exception", async () => {
            // Create specific data which should cause the failure
            const threePropsLabel = new Label("ThreeProps", "#333", [
                new NumberAttribute("attrOne", true, 1900),
                new StringAttribute("attrTwo", true, "empty"),
                new StringAttribute("attrThree", true, "empty"),
            ]);
            threePropsLabel.id = await writeLabel(threePropsLabel);

            const missingAttributeNode = new Node("MissingNode", "ThreeProps", { attrOne: 1234, attrTwo: "Alfons" });
            missingAttributeNode.id = await writeNode(missingAttributeNode);

            await expect(controller.getNode(missingAttributeNode.id)).rejects.toThrowError(
                InternalServerErrorException,
            );
        });

        it("should return the attribute the right datatypes", async () => {
            const resultNode = await controller.getNode(validNodeId);

            expect(typeof resultNode.attributes.attrOne).toBe("number");
            expect(typeof resultNode.attributes.attrTwo).toBe("string");
        });

        it("should return the node, that has no attributes", async () => {
            const mandaNode = await controller.getNode(nmNodeID);

            expect(mandaNode.attributes.attrOne).toEqual(42);
            expect(mandaNode.attributes.attrTwo).toEqual("GER");
            expect(mandaNode.attributes.attrThree).toBeUndefined();
        });
    });

    describe("searchNode", () => {
        it("should return the searched node", async () => {
            expect((await controller.searchNode("ave")).length).toEqual(1);
        });

        it("should return no node", async () => {
            expect((await controller.searchNode("zxy")).length).toEqual(0);
        });
    });

    describe("getAllNodes", () => {
        it("should return more than one node", async () => {
            expect((await controller.getAllNodes()).length).toBeGreaterThan(1);
        });

        it("should return one node", async () => {
            expect((await controller.getAllNodes(1, 1)).length).toBe(1);
        });
    });

    describe("getRelationsOfNode", () => {
        it("should return all relations of the node", async () => {
            const relations: Relation[] = await controller.getRelationsOfNode(movieNodeId);

            expect(relations.length).toBeGreaterThan(0);
            expect(relations[0].from).toEqual(movieNodeId);
            expect(relations[0].to).toEqual(validNodeId);
        });

        it("should throw an exception", async () => {
            const invalidRelation = new Relation("isHobbitOf", movieNodeId, nmNodeID, { attrOne: "Smaug" });
            invalidRelation.id = await writeRelation(invalidRelation);
            await expect(controller.getRelationsOfNode(movieNodeId)).rejects.toThrowError(InternalServerErrorException);
        });
    });

    /**
     * Helper functions
     */

    function writeLabel(l: Label): Promise<number> {
        // language=cypher
        const cypher = `
          MERGE (l:LabelScheme {name: $labelName})
          SET l.color = $color, l.attributes = $attribs
          RETURN l AS label`;

        const params = {
            labelName: l.name,
            color: l.color,
            attribs: JSON.stringify(l.attributes),
        };
        return neo4jService
            .write(cypher, params, process.env.DB_TOOL)
            .then((res) => res.records[0].get("label").identity.toNumber());
    }

    function writeRelationType(r: RelationType): Promise<number> {
        // language=cypher
        const cypher = `
          MERGE (rt:RelationType {name: $relType})
          SET rt.attributes = $attribs, rt.connections = $connects
          RETURN rt`;

        const params = {
            relType: r.name,
            attribs: JSON.stringify(r.attributes),
            connects: JSON.stringify(r.connections),
        };

        return neo4jService
            .write(cypher, params, process.env.DB_TOOL)
            .then((res) => res.records[0].get("rt").identity.toNumber());
    }

    function writeNode(node: Node): Promise<number> {
        // language=cypher
        const cypher = `
              MERGE (m:${node.label} {name: $name})
              SET m.attrOne = $attrOne, m.attrTwo = $attrTwo
              RETURN m AS ${node.label}`;

        const params = {
            name: node.name,
            label: node.label,
            attrOne: node.attributes.attrOne,
            attrTwo: node.attributes.attrTwo,
        };
        return neo4jService
            .write(cypher, params, process.env.DB_CUSTOMER)
            .then((res) => res.records[0].get(node.label).identity.toNumber());
    }

    function writeRelation(relation: Relation) {
        const cypher = `MATCH (start), (end) WHERE id(start) = $start AND id(end) = $end
                        CREATE(start)-[r:${relation.type}]->(end) SET r.attrOne = $attrOne RETURN r`;
        const params = {
            start: neo4jService.int(relation.from),
            end: neo4jService.int(relation.to),
            attrOne: relation.attributes.attrOne,
        };

        return neo4jService
            .write(cypher, params, process.env.DB_CUSTOMER)
            .then((res) => res.records[0].get("r").identity.toNumber());
    }
});
