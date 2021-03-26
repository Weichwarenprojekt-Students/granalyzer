import * as neo4j from "neo4j-driver";
import { Session } from "neo4j-driver";
import { Scheme } from "./models/scheme";
import { Label } from "./models/label";
import { StringAttribute } from "./models/attributes";
import { RelationType } from "./models/relationType";
import { Cardinality, Connection } from "./models/connection";

export class SchemeGenerator {
    /**
     *
     * @private Destination host machine
     */
    private readonly host: string;

    /**
     *
     * @private Destination service port
     */
    private readonly port: number;

    /**
     *
     * @private Username for database server
     */
    private readonly username: string;

    /**
     *
     * @private Password for database server
     */
    private readonly password: string;

    /**
     *
     * @private Name of database/scheme
     */
    private readonly database: string;

    /**
     *
     * @private Database session handle
     */
    private session: Session;

    /**
     * Constructor
     *
     * @param host Destination host machine
     * @param port Destination service port
     * @param username Username for database server
     * @param password Password for database server
     * @param database Name of database/scheme
     */
    constructor(host: string, port: string, username: string, password: string, database: string) {
        this.host = host;
        this.port = Number(port);
        this.username = username;
        this.password = password;
        this.database = database;
    }

    /**
     * Opens connection to the specified database
     */
    public openDBConnection() {
        const uri = "neo4j://" + this.host + ":" + this.port;
        const driver = neo4j.driver(uri, neo4j.auth.basic(this.username, this.password));
        this.session = driver.session({ database: this.database, defaultAccessMode: neo4j.session.WRITE });
    }

    /**
     * Closes connection to the specified database
     */
    public async closeDBConnection() {
        await this.session.close();
    }

    /**
     * Returns database records
     *
     * @param query The cypher query to be executed
     * @param args The arguments, marked with '$', used in the query
     * @param key The column which should be returned with corresponding
     * @private
     */
    private async fetchData(query: string, args: any, key: string): Promise<string[]> {
        const data: string[] = [];

        const result = await this.session.run(query, args);
        const records = result.records;

        for (let i = 0; i < records.length; i++) {
            // Add current row value from column, specified by 'key'
            data.push(records[i].get(key));
        }

        return data;
    }

    /**
     * Generates a random integer number
     * @param min Inclusive lower range
     * @param max Exclusive upper range
     * @private
     */
    private getRandomInt(min, max): number {
        /*
            https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in
            -javascript-in-a-specific-range
         */
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Generates a random RGB color in hex format with leading # prefix
     * @private
     */
    private getRandomColor(): string {
        const R = this.getRandomInt(0, 255);
        const G = this.getRandomInt(0, 255);
        const B = this.getRandomInt(0, 255);

        return (
            "#" + R.toString(16).padStart(2, "0") + G.toString(16).padStart(2, "0") + B.toString(16).padStart(2, "0")
        );
    }

    /**
     * Generates the schema for all labels from the database
     * @private
     */
    private async generateLabelScheme(): Promise<Label[]> {
        // Get all label names
        let query = `MATCH(node) WITH DISTINCT LABELS(node) AS
             labels UNWIND labels AS label RETURN DISTINCT label`;

        const labelNames = await this.fetchData(query, {}, "label");

        const labels: Label[] = [];

        for (let i = 0; i < labelNames.length; i++) {
            // Generate a new named label with a random color
            const newLabel = new Label(labelNames[i], this.getRandomColor());

            // Get all existing keys of properties/attributes of the current label
            query = `MATCH(node) WHERE $nodeName IN LABELS(node)
                       UNWIND KEYS(node) AS keys RETURN DISTINCT keys`;

            const labelAttributes = await this.fetchData(query, { nodeName: labelNames[i] }, "keys");

            for (let x = 0; x < labelAttributes.length; x++) {
                /*
                    By default, generate a new string attribute key
                    and add the current attribute key to the current label
                 */
                const newAttribute = new StringAttribute(labelAttributes[x]);
                newLabel.attributes.push(newAttribute);
            }

            labels[i] = newLabel;
        }

        return labels;
    }

    /**
     * Generates the relation type scheme from the database
     * @private
     */
    private async generateRelationTypeScheme(): Promise<RelationType[]> {
        const relationtypes: RelationType[] = [];

        // Get all relation types
        let query = `MATCH(startNode)-[relation]-(endNode) 
        RETURN DISTINCT TYPE(relation) AS types`;

        const relationNames = await this.fetchData(query, {}, "types");

        for (let i = 0; i < relationNames.length; i++) {
            const newType = new RelationType(relationNames[i]);

            // Get all existing keys of properties/attributes of the current relation
            query = `MATCH(startNode)-[relation]-(endNode) 
            WHERE TYPE(relation)=$relType UNWIND KEYS(relation)
             AS keys RETURN DISTINCT keys`;

            const relationAttributes = await this.fetchData(query, { relType: relationNames[i] }, "keys");

            for (let x = 0; x < relationAttributes.length; x++) {
                /*
                   By default, generate a new string attribute key
                   and add the current attribute key to the current relation
                */
                const newAttribute = new StringAttribute(relationAttributes[x]);
                newType.attributes.push(newAttribute);
            }

            // Get all connections for the current relation
            newType.connections = await this.getConnections(relationNames[i]);
            relationtypes.push(newType);
        }

        return relationtypes;
    }

    /**
     * Returns all connections for a specific relation
     * @param relationName Name of the node relation
     * @private
     */
    private async getConnections(relationName: string): Promise<Connection[]> {
        const connections: Connection[] = [];

        // Get all 'from' labels for this relation
        let query = `MATCH(startNode)-[relation]->(endNode) WHERE TYPE(relation)=$relationName
            UNWIND LABELS(startNode) AS froms RETURN DISTINCT froms;`;

        const froms = await this.fetchData(query, { relationName }, "froms");

        for (let i = 0; i < froms.length; i++) {
            // Get all "to" labels for this relation
            query = `MATCH(startNode)-[relation]->(endNode) WHERE $startLabel IN LABELS(startNode)
             AND TYPE(relation)=$relationName UNWIND LABELS(endNode) AS tos RETURN DISTINCT tos`;

            const tos = await this.fetchData(query, { startLabel: froms[i], relationName }, "tos");

            for (let x = 0; x < tos.length; x++) {
                // By default, connections always have M:N cardinalities
                const connection = new Connection(froms[i], tos[x], Cardinality.N, Cardinality.N);
                connections.push(connection);
            }
        }
        return connections;
    }

    /**
     * Generates the data scheme of the connected database
     */
    public async getDataScheme(): Promise<Scheme> {
        const labels = await this.generateLabelScheme();
        const relationTypes = await this.generateRelationTypeScheme();
        return new Scheme(labels, relationTypes);
    }
}
