import { Test } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { Neo4jModule, Neo4jService } from "nest-neo4j/dist";
import { UtilModule } from "./util.module";
import Node from "../nodes/node.model";
import Relation from "../relations/relation.model";
import { Injectable, NotFoundException } from "@nestjs/common";
import { LabelScheme } from "../data-scheme/models/label-scheme.model";
import { RelationType } from "../data-scheme/models/relation-type.model";

/**
 * Helper utils for automated tests
 */
@Injectable()
export default class TestUtil {
    constructor(private readonly neo4jService: Neo4jService) {}

    /**
     * Creates the testing module required to mock the app in the integration tests
     *
     * @param providers
     * @param controllers
     * @param imports
     */
    static createTestingModule(providers = [], controllers = [], imports = []) {
        function suffixDatabases(config: Record<string, unknown>) {
            config.DB_TOOL += "test";
            config.DB_CUSTOMER += "test";
            return config;
        }

        return Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    validate: suffixDatabases,
                }),
                Neo4jModule.forRoot({
                    scheme: "bolt",
                    host: process.env.DB_HOST,
                    port: process.env.DB_PORT,
                    username: process.env.DB_USERNAME,
                    password: process.env.DB_PASSWORD,
                }),
                UtilModule.forRoot(),
            ].concat(imports),
            controllers: [].concat(controllers),
            providers: [].concat(providers),
        }).compile();
    }

    /**
     * Defines the attribute to be sorted by
     * @param prop The name of the JSON attribute to be searched by
     */
    static getSortOrder(prop: string) {
        return function (a, b) {
            if (a[prop] > b[prop]) {
                return 1;
            } else if (a[prop] < b[prop]) {
                return -1;
            }
            return 0;
        };
    }

    async writeNode(node: Node): Promise<string> {
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
        return this.neo4jService
            .write(cypher, params, process.env.DB_CUSTOMER)
            .then((res) => res.records[0].get("n").nodeId);
    }

    async writeRelation(relation: Relation) {
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

        return this.neo4jService
            .write(cypher, params, process.env.DB_CUSTOMER)
            .then((res) => res.records[0].get("r").relationId);
    }

    async writeLabelScheme(l: LabelScheme): Promise<string> {
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

        const resolveWrite = (res) => res.records[0].get("label").name;
        return this.neo4jService.write(cypher, params, process.env.DB_TOOL).then(resolveWrite);
    }

    async writeRelationType(r: RelationType): Promise<string> {
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

        return this.neo4jService
            .write(cypher, params, process.env.DB_TOOL)
            .then((res) => res.records[0].get("rt").name);
    }

    async readDBNode(nodeId: string): Promise<Node> {
        // language=Cypher
        const query = `
          MATCH (n)
            WHERE n.nodeId = $nodeId
          WITH LABELS(n) AS lbls, n
          UNWIND lbls AS label
          RETURN n {. *, label:label} AS node`;
        const params = {
            nodeId,
        };

        const record = (await this.neo4jService.read(query, params, process.env.DB_CUSTOMER)).records[0];
        if (!record) throw new NotFoundException("No results to return");

        const attributes = record.get("node");
        const node = {
            nodeId: record.get("node").nodeId,
            name: record.get("node").name,
            label: record.get("node").label,
            attributes: attributes,
        } as Node;
        return node;
    }

    async readDBRelation(relationId: string): Promise<Relation> {
        // language=cypher
        const query = `MATCH(startNode)-[relation]->(endNode) 
                         WHERE relation.relationId = $relationId
                       WITH startNode.nodeId AS from,
                            endNode.nodeId AS to, relation
                       RETURN relation { .*, type:TYPE(relation), from:from, to:to} as relation;`;
        const params = { relationId };

        const record = (await this.neo4jService.read(query, params, process.env.DB_CUSTOMER)).records[0];
        if (!record) throw new NotFoundException("No results to return");

        const attributes = record.get("relation");
        const relation = {
            relationId: record.get("relation").relationId,
            type: record.get("relation").type,
            from: record.get("relation").from,
            to: record.get("relation").to,
            attributes: attributes,
        } as Relation;
        return relation;
    }
}
