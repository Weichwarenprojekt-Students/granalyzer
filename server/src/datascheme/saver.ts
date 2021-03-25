import * as neo4j from "neo4j-driver";
import { Driver, Session } from "neo4j-driver";
import { Scheme } from "./models/scheme";
import { Label } from "./models/label";
import { RelationType } from "./models/relationType";

export class Saver {
    /**
     * @private Configure the tool database
     */
    private readonly database = process.env.DB_TOOL;

    /**
     * Constructor
     *
     * @param driver Instance of the neo4j driver
     * @private
     */
    private constructor(private readonly driver: Driver) {}

    /**
     * Execute a function with an instance of the saver
     *
     * Automatically closes the neo4j driver connection which is needed for the scheme saver.
     *
     * @param fn The function to execute
     */
    static async doWithDriver(fn: (saver: Saver) => void) {
        // Construct instance of this saver
        const driver = this.getDriver();
        const instance = new Saver(driver);

        // Execute the function
        await fn(instance);

        // Cleanup by closing the driver
        await driver.close();
    }

    /**
     * Get instance of a configured neo4j driver
     * @private
     */
    private static getDriver() {
        return neo4j.driver(
            `bolt://${process.env.DB_HOST}:${process.env.DB_PORT}`,
            neo4j.auth.basic(process.env.DB_USERNAME, process.env.DB_PASSWORD),
        );
    }

    /**
     * Save a data scheme in the tool db
     *
     * @param scheme The scheme that should be saved
     */
    async writeScheme(scheme: Scheme) {
        const sess = this.driver.session({ database: this.database, defaultAccessMode: neo4j.session.WRITE });

        // Write all labels to the DB
        for (const l of scheme.labels) {
            await this.writeLabel(l, sess);
        }

        // Write all relation types to the DB
        for (const r of scheme.relationTypes) {
            await this.writeRelationType(r, sess);
        }

        await sess.close();
    }

    /**
     * Write the scheme for one label into the tool DB
     *
     * @param l the scheme for the label to be saved
     * @param sess the session that is used to write into the database
     * @private
     */
    private async writeLabel(l: Label, sess: Session) {
        await sess
            // language=cypher
            .run(
                "MERGE (l:LabelScheme {name: $labelName}) SET l.color = $color, l.attributes = $attribs RETURN l AS label",
                {
                    labelName: l.name,
                    color: l.color,
                    attribs: JSON.stringify(l.attributes),
                },
            )
            .then((res) => {
                res.records.forEach((rec) => {
                    console.log(rec.get("label"));
                });
            })
            .catch((err) => {
                console.error(err);
            });
    }

    /**
     * Write the scheme for one relation type into the tool DB
     *
     * @param r the scheme for the relation type to be saved
     * @param sess the session that is used to write into the DB
     * @private
     */
    private async writeRelationType(r: RelationType, sess: Session) {
        await sess
            // language=cypher
            .run(
                "MERGE (r:RelationType {name: $labelName}) SET r.attributes = $attribs, r.connections = $connects RETURN r AS relation",
                {
                    labelName: r.name,
                    attribs: JSON.stringify(r.attributes),
                    connects: JSON.stringify(r.connections),
                },
            )
            .then((res) => {
                res.records.forEach((rec) => {
                    console.log(rec.get("relation"));
                });
            })
            .catch((err) => {
                console.error(err);
            });
    }
}
