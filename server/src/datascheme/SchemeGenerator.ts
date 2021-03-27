import * as neo4j from "neo4j-driver";
import { Driver, Session } from "neo4j-driver";
import { Scheme } from "./models/scheme";
import { Label } from "./models/label";
import { StringAttribute } from "./models/attributes";
import { RelationType } from "./models/relationType";
import { Connection } from "./models/connection";

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
        const randomChannelColor = () => {
            return Math.floor(Math.random() * (255 + 1));
        };

        const R = randomChannelColor();
        const G = randomChannelColor();
        const B = randomChannelColor();

        const toHex = (c: number) => {
            return c.toString(16).padStart(2, "0");
        };

        return "#" + toHex(R) + toHex(G) + toHex(B);
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
        const data: string[] = [];

        const result = await session.run(query, args);
        const records = result.records;

        records.forEach((record) => {
            // Add current row value from column, specified by 'key'
            data.push(record.get(key));
        });

        return data;
    }

    /**
     * Generates the schema for all labels from the database
     * @param session Database session
     * @private
     */
    private static async generateLabelScheme(session: Session): Promise<Label[]> {
        // Get all label names
        // language=cypher
        let query = `
          MATCH(node)
          WITH DISTINCT labels(node) AS
                        labels
          UNWIND labels AS label
          RETURN DISTINCT label`;

        const labelNames = await this.fetchData(query, {}, "label", session);

        const labels: Label[] = [];

        for (const labelName of labelNames) {
            // Generate a new named label with a random color
            const newLabel = new Label(labelName, SchemeGenerator.getRandomColor());

            // Get all existing keys of properties/attributes of the current label
            // language=cypher
            query = `
              MATCH(node)
                WHERE $nodeName IN labels(node)
              UNWIND keys(node) AS keys
              RETURN DISTINCT keys`;

            const labelAttributes = await this.fetchData(query, { nodeName: labelName }, "keys", session);

            labelAttributes.forEach((attr) => {
                // Generate a new string attribute key and add the current attribute key to the current label
                const newAttribute = new StringAttribute(attr);
                newLabel.attributes.push(newAttribute);
            });

            labels.push(newLabel);
        }

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
              UNWIND keys(relation)
              AS keys
              RETURN DISTINCT keys`;

            const relationAttributes = await this.fetchData(query, { relType: relationName }, "keys", session);

            relationAttributes.forEach((attr) => {
                // Generate a new string attribute and add the current attribute key to the current relation
                const newAttribute = new StringAttribute(attr);
                newType.attributes.push(newAttribute);
            });

            // Get all connections for the current relation
            newType.connections = await this.getConnections(relationName, session);
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
        const connections: Connection[] = [];

        // Get all 'from' labels for this relation
        // language=cypher
        let query = `
          MATCH(startNode)-[relation]->(endNode)
            WHERE type(relation) = $relationName
          UNWIND labels(startNode) AS froms
          RETURN DISTINCT froms;`;

        const froms = await this.fetchData(query, { relationName }, "froms", session);

        for (const from of froms) {
            // Get all "to" labels for this relation
            // language=cypher
            query = `
              MATCH(startNode)-[relation]->(endNode)
                WHERE $startLabel IN labels(startNode)
                AND type(relation) = $relationName
              UNWIND labels(endNode) AS tos
              RETURN DISTINCT tos`;

            const tos = await this.fetchData(query, { startLabel: from, relationName }, "tos", session);

            tos.forEach((to) => {
                // By default, connections always have M:N cardinalities
                const connection = new Connection(from, to);
                connections.push(connection);
            });
        }
        return connections;
    }
}
