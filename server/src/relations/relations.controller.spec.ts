/**
 * @group db/relations/controller
 */

import { TestingModule } from "@nestjs/testing";
import { RelationsService } from "./relations.service";
import { Neo4jService } from "nest-neo4j/dist";
import { RelationsController } from "./relations.controller";
import TestUtil from "../util/test.util";
import { DatabaseUtil } from "../util/database.util";
import Node from "../nodes/node.model";
import Relation from "./relation.model";
import { LabelScheme } from "../data-scheme/models/labelScheme";
import { RelationType } from "../data-scheme/models/relationType";
import { NumberAttribute, StringAttribute } from "../data-scheme/models/attributes";
import { Connection } from "../data-scheme/models/connection";

describe("RelationsController", () => {
    let module: TestingModule;

    let neo4jService: Neo4jService;
    let databaseUtil: DatabaseUtil;

    let controller: RelationsController;
    let service: RelationsService;

    let movieNodeId: string;
    let validNodeId: string;

    let validRelation: Relation;

    // Init services and controllers before testing
    beforeAll(async () => {
        // Create main module for testing
        module = await TestUtil.createTestingModule([RelationsService], [RelationsController]);

        controller = module.get<RelationsController>(RelationsController);
        service = module.get<RelationsService>(RelationsService);

        neo4jService = module.get<Neo4jService>(Neo4jService);
        databaseUtil = module.get<DatabaseUtil>(DatabaseUtil);

        await databaseUtil.initDatabase();
        await databaseUtil.clearDatabase();
    });

    // Create the test data
    beforeEach(async () => {
        // Write the labels
        const movieLabel = new LabelScheme("Movie", "#EEE", [
            new NumberAttribute("attrOne", true, 1900),
            new StringAttribute("attrTwo", false, "empty"),
        ]);
        movieLabel.name = await writeLabel(movieLabel);

        const validLabel = new LabelScheme("validLabel", "#222", [
            new NumberAttribute("attrOne", true, 1900),
            new StringAttribute("attrTwo", true, "empty"),
        ]);
        validLabel.name = await writeLabel(validLabel);

        // Write the relation types
        const hobbitRelation = new RelationType(
            "isHobbitOf",
            [new StringAttribute("attrOne", false)],
            [new Connection(movieLabel.name, validLabel.name)],
        );
        hobbitRelation.name = await writeRelationType(hobbitRelation);

        const directedRelation = new RelationType(
            "directed",
            [new StringAttribute("attrOne", false)],
            [new Connection(validLabel.name, movieLabel.name)],
        );
        directedRelation.name = await writeRelationType(directedRelation);

        // Write the nodes
        const movieNode = new Node("Avengers", "Movie", { attrOne: 1990, attrTwo: "GER" });
        movieNode.nodeId = await writeNode(movieNode);
        movieNodeId = movieNode.nodeId;

        const validNode = new Node("ValidNode", "validLabel", { attrOne: 1234, attrTwo: "HansPeter" });
        validNode.nodeId = await writeNode(validNode);
        validNodeId = validNode.nodeId;

        // Write the relation
        validRelation = new Relation("isHobbitOf", movieNode.nodeId, validNode.nodeId, { attrOne: "Gandalf" });
        validRelation.relationId = await writeRelation(validRelation);
    });

    // Clean up the database after each test
    afterEach(async () => {
        await databaseUtil.clearDatabase();
    });

    // Check if the creation of controller and services has been performed successfully
    it("should be defined", () => {
        expect(controller).toBeDefined();
        expect(service).toBeDefined();
        expect(neo4jService).toBeDefined();
    });

    describe("getRelation", () => {
        it("should return the correct relation", async () => {
            expect(await controller.getRelation(validRelation.relationId)).toEqual(validRelation);
        });
    });

    describe("getAllRelations", () => {
        it("should return 0 relations when there are no relations", async () => {
            // Clear the database which should make it impossible to find relations
            await databaseUtil.clearDatabase();
            expect((await controller.getAllRelations()).length).toBe(0);
        });

        it("should return 1 relation because there is only one relation in DB", async () => {
            // Clear the database which should make it impossible to find relations
            expect((await controller.getAllRelations()).length).toBe(1);
        });

        it("should contain 2 specific correct relations", async () => {
            // Write the relation
            const validRelation2 = new Relation("directed", validNodeId, movieNodeId, { attrOne: "Peter" });
            validRelation2.relationId = await writeRelation(validRelation2);

            expect((await controller.getAllRelations()).sort(TestUtil.getSortOrder("relationId"))).toEqual(
                [{ ...validRelation }, { ...validRelation2 }].sort(TestUtil.getSortOrder("relationId")),
            );
        });
    });

    /**
     * Helper functions
     */

    function writeLabel(l: LabelScheme): Promise<string> {
        // language=cypher
        const cypher = `
          CREATE (l:LabelScheme {name: $labelName})
          SET l.color = $color, l.attributes = $attribs
          RETURN l {. *} AS label`;

        const params = {
            labelName: l.name,
            color: l.color,
            attribs: JSON.stringify(l.attributes),
        };

        const resolveWrite = (res) => {
            return res.records[0].get("label").name;
        };
        return neo4jService
            .write(cypher, params, process.env.DB_TOOL)
            .then(resolveWrite)
            .catch(databaseUtil.catchDbError);
    }

    function writeRelationType(r: RelationType): Promise<string> {
        // language=cypher
        const cypher = `
          CREATE (rt:RelationType {name: $relType})
          SET rt.attributes = $attribs, rt.connections = $connects
          RETURN rt {. *}`;

        const params = {
            relType: r.name,
            attribs: JSON.stringify(r.attributes),
            connects: JSON.stringify(r.connections),
        };

        return neo4jService
            .write(cypher, params, process.env.DB_TOOL)
            .then((res) => res.records[0].get("rt").name)
            .catch(databaseUtil.catchDbError);
    }

    function writeNode(node: Node): Promise<string> {
        // language=cypher
        const cypher = `
          CREATE (m:${node.label} {nodeId: apoc.create.uuid(), name: $name, attrOne: $attrOne, attrTwo: $attrTwo})
          RETURN m {. *} AS n`;

        const params = {
            name: node.name,
            label: node.label,
            attrOne: node.attributes.attrOne,
            attrTwo: node.attributes.attrTwo,
        };
        return neo4jService
            .write(cypher, params, process.env.DB_CUSTOMER)
            .then((res) => res.records[0].get("n").nodeId)
            .catch(databaseUtil.catchDbError);
    }

    function writeRelation(relation: Relation) {
        // language=Cypher
        const cypher = `
          MATCH (s {nodeId: $from}), (e {nodeId: $to})
          CREATE(s)-[r:${relation.type}]->(e)
          SET r.relationId = apoc.create.uuid(), r.attrOne = $attrOne
          RETURN r {. *}`;

        const params = {
            from: relation.from,
            to: relation.to,
            attrOne: relation.attributes.attrOne,
        };

        return neo4jService
            .write(cypher, params, process.env.DB_CUSTOMER)
            .then((res) => res.records[0].get("r").relationId)
            .catch(databaseUtil.catchDbError);
    }
});
