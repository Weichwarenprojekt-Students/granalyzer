import * as neo4j from "neo4j-driver";
import { Driver, Neo4jError, Session } from "neo4j-driver";
import { Scheme } from "../data-scheme.model";
import { LabelScheme } from "../models/label-scheme.model";
import { StringAttribute } from "../models/attributes.model";
import { RelationType } from "../models/relation-type.model";
import { Connection } from "../models/connection.model";

export class SchemeGenerator {
    /**
     * Generates the data scheme of the connected database
     * @param driver Neo4j driver
     */
    public static async getDataScheme(driver: Driver): Promise<Scheme> {
        const session = driver.session({ database: process.env.DB_CUSTOMER, defaultAccessMode: neo4j.session.WRITE });

        const labels = await this.generateLabelScheme(session);
        const relationTypes = await this.generateRelationTypeScheme(session);

        await session.close();

        return new Scheme(labels, relationTypes);
    }

    /**
     * Generates a random RGB color in hex format with leading # prefix
     * @private
     */
    private static getRandomColor(): string {
        // Define constants for range calculation
        const min = 50;
        const width = 180;

        // Generate color values and check for bigger than the allowed 255
        const R = SchemeGenerator.randomRangeValue(width, min);
        const G = (R + SchemeGenerator.randomRangeValue(width, min)) % 255;
        const B = (G + SchemeGenerator.randomRangeValue(width, min)) % 255;

        // Convert the three int values to a concatenated hex color value
        return "#" + SchemeGenerator.toHex(R) + SchemeGenerator.toHex(G) + SchemeGenerator.toHex(B);
    }

    /**
     * Convert number to hex
     * @private
     */
    private static toHex(c: number) {
        return c.toString(16).padStart(2, "0");
    }

    /**
     * Generates value between min and min + width
     *
     * @private
     */
    private static randomRangeValue(width: number, min: number): number {
        return Math.floor(Math.random() * (width + 1) + min);
    }

    /**
     * Returns database records
     *
     * @param query The cypher query to be executed
     * @param args The arguments, marked with '$', used in the query
     * @param key The column which should be returned with corresponding
     * @param session Database session
     * @private
     */
    private static async fetchData(query: string, args: any, key: string, session: Session): Promise<string[]> {
        const result = await session.run(query, args);

        // Add current row value from column, specified by 'key'
        return result.records.map((record) => record.get(key));
    }

    /**
     * Generates the schema for all labels from the database
     * @param session Database session
     * @private
     */
    private static async generateLabelScheme(session: Session): Promise<LabelScheme[]> {
        // Get all label names
        // language=cypher
        let query = `
          MATCH(node)
          WITH DISTINCT labels(node) AS
                        labels
          UNWIND labels AS label
          RETURN DISTINCT label`;

        const labelNames = await this.fetchData(query, {}, "label", session);

        const labels: LabelScheme[] = [];

        for (const labelName of labelNames) {
            // Generate a new named label with a random color
            const newLabel = new LabelScheme(labelName, SchemeGenerator.getRandomColor());

            // Get all existing keys of properties/attributes of the current label
            // language=cypher
            query = `
              MATCH(node)
                WHERE $nodeName IN labels(node)
              UNWIND keys(node) AS keys
              WITH keys WHERE keys <> "nodeId" AND keys <> "name"
              RETURN DISTINCT keys`;

            const labelAttributes = await this.fetchData(query, { nodeName: labelName }, "keys", session);

            // Generate a new string attribute key and add the current attribute key to the current label
            newLabel.attributes = labelAttributes.map((attr) => new StringAttribute(attr));

            await this.createCustomerLabelConstraint(newLabel, session);

            labels.push(newLabel);
        }

        await this.createFullTextScheme(labelNames, ["nodeId"], session);

        return labels;
    }

    /**
     * Generates the relation type scheme from the database
     * @param session Database session
     * @private
     */
    private static async generateRelationTypeScheme(session: Session): Promise<RelationType[]> {
        const relationTypes: RelationType[] = [];

        // Get all relation types
        // language=cypher
        let query = `
          MATCH (startNode)-[relation]-(endNode)
          RETURN DISTINCT type(relation) AS types`;

        const relationNames = await this.fetchData(query, {}, "types", session);

        for (const relationName of relationNames) {
            const newType = new RelationType(relationName);

            // Get all existing keys of properties/attributes of the current relation
            // language=cypher
            query = `
              MATCH(startNode)-[relation]-(endNode)
                WHERE type(relation) = $relType
              UNWIND keys(relation) AS keys
              WITH keys WHERE keys <> "relationId"
              RETURN DISTINCT keys`;

            const relationAttributes = await this.fetchData(query, { relType: relationName }, "keys", session);

            // Generate a new string attribute and add the current attribute key to the current relation
            newType.attributes = relationAttributes.map((attr) => new StringAttribute(attr));

            // Get all connections for the current relation
            newType.connections = await this.getConnections(relationName, session);

            await this.createCustomerRelationIds(newType, session);

            relationTypes.push(newType);
        }

        return relationTypes;
    }

    /**
     * Returns all connections for a specific relation
     * @param relationName Name of the node relation
     * @param session Database session
     * @private
     */
    private static async getConnections(relationName: string, session: Session): Promise<Connection[]> {
        // language=cypher
        const query = `
          MATCH(startNode)-[relation]->(endNode)
            WHERE type(relation) = $relationName
          UNWIND labels(startNode) AS froms
          UNWIND labels(endNode) AS tos
          RETURN DISTINCT froms, tos`;

        const result = await session.run(query, { relationName });

        // By default, connections always have M:N cardinalities
        return result.records.map((record) => new Connection(record.get("froms"), record.get("tos")));
    }

    /**
     *  Creates constraints and apoc uuids for each label in the customer database
     *
     * @param labelScheme
     * @param session
     */
    private static async createCustomerLabelConstraint(labelScheme: LabelScheme, session: Session) {
        // Create UUID's on existing elements
        // language=cypher
        const createNodeUuidQuery = `
          MATCH (node:\`${labelScheme.name}\`)
            WHERE NOT exists(node.nodeId)
          SET node.nodeId = apoc.create.uuid()
        `;
        await session.run(createNodeUuidQuery, {}).catch(console.error);

        // Create the unique constraints for the specific label
        const createConstraintQuery = `CREATE CONSTRAINT \`${labelScheme.name}Key\` IF NOT exists
        ON (n:\`${labelScheme.name}\`)
        ASSERT (n.nodeId) IS NODE KEY`;
        await session.run(createConstraintQuery).catch(console.error);
    }

    /**
     * Create a full-text scheme index on all nodeId's, if one already exists drop it first so it will be updated
     *
     * @param labels The labels that will be indexed
     * @param indexedAttrs The attributes on those labels that will be indexed
     * @param session
     * @private
     */
    private static async createFullTextScheme(labels: string[], indexedAttrs: string[], session: Session) {
        // language=cypher
        const cypherWriteIndex = `
          CALL db.index.fulltext.createNodeIndex('allNodesIndex', $labels, $indexedAttrs)
        `;

        // language=cypher
        const cypherDropIndex = `
          CALL db.index.fulltext.drop('allNodesIndex')
        `;

        const params = {
            labels,
            indexedAttrs,
        };

        await session.run(cypherDropIndex).catch((err) => {
            if (err instanceof Neo4jError) {
                switch (err.code) {
                    case "Neo.ClientError.Procedure.ProcedureCallFailed":
                        console.log("Index not dropped because it didn't exist");
                }
            }
        });

        await session.run(cypherWriteIndex, params).catch((err) => console.log(err));
    }

    /**
     * Creates UUIDs for each relation.
     * There is no possibility to create a key constrain on relations, but we assert them to be unique.
     */
    private static async createCustomerRelationIds(relationType: RelationType, session: Session) {
        // Create UUID for each relation
        // language=cypher
        const createRelationUuidQuery = `
          MATCH ()-[rel:\`${relationType.name}\`]-()
            WHERE NOT exists(rel.relationId)
          SET rel.relationId = apoc.create.uuid()
        `;
        await session.run(createRelationUuidQuery, {}).catch(console.error);

        // Create the exists constraints for the specific relation type
        const createConstraintQuery = `
          CREATE CONSTRAINT \`${relationType.name}Key\` IF NOT exists
          ON ()-[type:\`${relationType.name}\`]-()
          ASSERT exists(type.relationId)
        `;
        await session.run(createConstraintQuery).catch(console.error);
    }
}
