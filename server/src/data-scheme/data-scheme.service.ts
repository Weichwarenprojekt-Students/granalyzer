import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import { Scheme } from "./data-scheme.model";
import { RelationType } from "./models/relationType";
import { LabelScheme } from "./models/labelScheme";
import { DatabaseUtil } from "../util/database.util";
import Relation from "../relations/relation.model";
import { DataSchemeUtil } from "../util/data-scheme.util";

@Injectable()
export class DataSchemeService {
    /**
     * The name of the customer database
     */
    private customerDb = process.env.DB_CUSTOMER;
    /**
     * The name of the tool database
     */
    private readonly database = process.env.DB_TOOL;

    constructor(
        private readonly neo4jService: Neo4jService,
        private readonly dataSchemeUtil: DataSchemeUtil,
        private readonly databaseUtil: DatabaseUtil,
    ) {}

    /**
     * Fetch all entries of the scheme
     */
    async getScheme(): Promise<Scheme> {
        return new Scheme(await this.getAllLabelSchemes(), await this.getAllRelationTypes());
    }

    /**
     * Fetch all labels of the scheme
     */
    async getAllLabelSchemes(): Promise<Array<LabelScheme>> {
        // language=cypher
        const cypher = `
          MATCH (ls:LabelScheme)
          RETURN ls {. *} AS dataScheme`;
        const params = {};

        // Callback function which is applied on the neo4j response
        const resolveRead = (res) => res.records.map(this.dataSchemeUtil.parseLabelScheme);

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Fetch the label with specific name
     */
    async getLabelScheme(name: string): Promise<LabelScheme> {
        return this.dataSchemeUtil.getLabelScheme(name);
    }

    /**
     * Adds a new label scheme to the db
     */
    async addLabelScheme(label: LabelScheme): Promise<LabelScheme> {
        // language=Cypher
        const cypher = `
          CREATE (ls:LabelScheme {name: $name, color: $color, attributes: $attributes})
          RETURN ls {. *} AS dataScheme`;

        const params = {
            name: label.name,
            color: label.color,
            attributes: JSON.stringify(label.attributes),
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            return this.dataSchemeUtil.parseLabelScheme(res.records[0]);
        };

        return this.neo4jService
            .write(cypher, params, this.database)
            .then(resolveWrite)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Adds a new label scheme to the db
     */
    async updateLabelScheme(name: string, label: LabelScheme): Promise<LabelScheme> {
        // language=Cypher
        const cypher = `
          MATCH (ls:LabelScheme {name: $name})
          SET ls.color = $color, ls.attributes = $attributes
          RETURN ls {. *} AS dataScheme`;

        const params = {
            name,
            color: label.color,
            attributes: JSON.stringify(label.attributes),
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            return this.dataSchemeUtil.parseLabelScheme(res.records[0]);
        };

        await this.checkConflicts(label);
        return this.neo4jService
            .write(cypher, params, this.database)
            .then(resolveWrite)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Check for conflicts
     */
    async checkConflicts(label: LabelScheme): Promise<void> {
        // language=Cypher
        const cypher = `
          MATCH (n:${label.name})
          RETURN n {. *, label:$label} AS node`;

        const params = {
            label: label.name,
        };

        let conflicts = 0;
        const resolveRead = async (result) =>
            await result.records.map(async (el) => {
                try {
                    return await this.dataSchemeUtil.parseNode(el, label);
                } catch (e) {
                    console.log(e);
                    conflicts++;
                }
            });
        const nodes = await this.neo4jService
            .read(cypher, params, this.customerDb)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
        nodes.forEach((node) => {
            label.attributes.forEach((attribute) => {
                if (this.dataSchemeUtil.hasConflict(attribute, node)) conflicts++;
            });
        });
        if (conflicts > 0) {
            throw new ConflictException(conflicts);
        }
    }

    /**
     * Deletes a label scheme from the db
     */
    async deleteLabelScheme(name: string): Promise<LabelScheme> {
        // language=cypher
        const cypher = `
          MATCH (ls:LabelScheme {name: $name})
          WITH ls, properties(ls) AS copyLs
          DETACH DELETE ls
          RETURN copyLs {. *} AS dataScheme`;

        const params = {
            name,
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            if (!res.records[0]) throw new NotFoundException(`The label ${name} has not been found`);
            return this.dataSchemeUtil.parseLabelScheme(res.records[0]);
        };

        return this.neo4jService
            .write(cypher, params, this.database)
            .then(resolveWrite)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Fetch all relations
     */
    async getAllRelationTypes(): Promise<Array<RelationType>> {
        // language=cypher
        const cypher = "MATCH (rt:RelationType) RETURN rt {.*} AS dataScheme";
        const params = {};

        // Callback function which is applied on the neo4j response
        const resolveRead = (res) => res.records.map(this.dataSchemeUtil.parseRelationType);

        return this.neo4jService
            .read(cypher, params, this.database)
            .then(resolveRead)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Fetch the relation with specific name
     */
    async getRelationType(name: string): Promise<RelationType> {
        return this.dataSchemeUtil.getRelationType(name);
    }

    /**
     * Adds a new relation type
     */
    async addRelationType(relationType: RelationType): Promise<RelationType> {
        // language=Cypher
        const cypher = `
          CREATE (rt:RelationType {name: $name, attributes: $attributes, connections: $connections})
          RETURN rt {. *} AS dataScheme`;

        const params = {
            name: relationType.name,
            attributes: JSON.stringify(relationType.attributes),
            connections: JSON.stringify(relationType.connections),
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            return this.dataSchemeUtil.parseRelationType(res.records[0]);
        };

        return this.neo4jService
            .write(cypher, params, this.database)
            .then(resolveWrite)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Adds a new label scheme to the db
     */
    async updateRelationType(name: string, relationType: RelationType): Promise<LabelScheme> {
        // language=Cypher
        const cypher = `
          MATCH (rt:RelationType {name: $name})
          SET rt.attributes = $attributes, rt.connections = $connections
          RETURN rt {. *} AS dataScheme`;

        const params = {
            name,
            attributes: JSON.stringify(relationType.attributes),
            connections: JSON.stringify(relationType.connections),
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            return this.dataSchemeUtil.parseRelationType(res.records[0]);
        };

        return this.neo4jService
            .write(cypher, params, this.database)
            .then(resolveWrite)
            .catch(this.databaseUtil.catchDbError);
    }

    /**
     * Deletes a relation type from the db
     */
    async deleteRelationType(name: string): Promise<Relation> {
        // language=cypher
        const cypher = `
          MATCH (rt:RelationType {name: $name})
          WITH rt, properties(rt) AS copyRt
          DETACH DELETE rt
          RETURN copyRt {. *} AS dataScheme`;

        const params = {
            name,
        };

        // Callback function which is applied on the neo4j response
        const resolveWrite = (res) => {
            if (!res.records[0]) throw new NotFoundException(`The relation type ${name} has not been found`);
            return this.dataSchemeUtil.parseRelationType(res.records[0]);
        };

        return this.neo4jService
            .write(cypher, params, this.database)
            .then(resolveWrite)
            .catch(this.databaseUtil.catchDbError);
    }
}
