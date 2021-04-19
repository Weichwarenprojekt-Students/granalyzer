import { Injectable } from "@nestjs/common";
import { Neo4jService } from "nest-neo4j/dist";
import { DataSchemeUtil } from "../util/data-scheme.util";
import { DatabaseUtil } from "../util/database.util";
import Relation from "./relation.model";

@Injectable()
export class RelationsAttributesService {
    /**
     * Customer database
     */
    private database = process.env.DB_CUSTOMER;

    constructor(
        private readonly neo4jService: Neo4jService,
        private readonly dataSchemeUtil: DataSchemeUtil,
        private readonly databaseUtil: DatabaseUtil,
    ) {}

    /**
     * Modifies the attributes of the specified relation
     * @param relation The node to be modified
     */
    setAttributes(relation: Relation): Relation {
        // TODO: Implement service
        return undefined;
    }
}
