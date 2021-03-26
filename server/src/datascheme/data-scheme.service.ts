import { Injectable, NotFoundException } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import * as neo4j from "neo4j-driver";

@Injectable()
export class DataSchemeService {
    constructor(private readonly neo4jService: Neo4jService) {}

    /**
     * @private Configures the tool database
     */
    private readonly database = process.env.DB_TOOL;

    /**
     * Fetch all entries of the scheme
     */
    async getScheme() {
        const cypher = "MATCH (ds) RETURN ds AS datascheme";
        const params = {};

        return this.neo4jService
            .read(cypher, params, this.database)
            .then((res) => res.records.map(DataSchemeService.parseDataScheme));
    }

    /**
     * Fetch all labels of the scheme
     */
    async getAllLabel() {
        const cypher = "MATCH (ls:LabelScheme) RETURN ls AS datascheme";
        const params = {};

        return this.neo4jService
            .read(cypher, params, this.database)
            .then((res) => res.records.map(DataSchemeService.parseDataScheme));
    }

    /**
     * Fetch the label with id id
     * @param id
     */
    async getLabel(id: number) {
        const cypher = "MATCH (ls:LabelScheme) WHERE id(ls) = $id RETURN ls AS datascheme";
        const params = {
            id: neo4j.int(id),
        };

        return this.neo4jService.read(cypher, params, this.database).then((res) => {
            if (!res.records.length) {
                throw new NotFoundException("Label with id: " + id + " not found");
            }
            return DataSchemeService.parseDataScheme(res.records[0]);
        });
    }

    /**
     * Fetch all relations
     */
    async getAllRelations() {
        const cypher = "MATCH (rt:RelationType) RETURN rt AS datascheme";
        const params = {};

        return this.neo4jService
            .read(cypher, params, this.database)
            .then((res) => res.records.map(DataSchemeService.parseDataScheme));
    }

    /**
     * Fetch the relation with id id
     * @param id
     */
    async getRelation(id: number) {
        const cypher = "MATCH (rt:RelationType) WHERE id(rt) = $id RETURN rt AS datascheme";
        const params = {
            id: neo4j.int(id),
        };

        return this.neo4jService.read(cypher, params, this.database).then((res) => {
            if (!res.records.length) {
                throw new NotFoundException("Relation with id: " + id + " not found");
            }
            return DataSchemeService.parseDataScheme(res.records[0]);
        });
    }

    private static parseDataScheme(record: Record<any, any>) {
        return {
            ...record.get("datascheme").properties,
            id: record.get("datascheme").identity.toNumber(),
        };
    }
}
