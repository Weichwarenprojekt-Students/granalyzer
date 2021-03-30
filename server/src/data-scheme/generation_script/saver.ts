import * as neo4j from "neo4j-driver";
import { Driver, Session } from "neo4j-driver";
import { Label } from "../models/label";
import { RelationType } from "../models/relationType";
import { Scheme } from "../data-scheme.model";

export class SchemeSaver {
    /**
     * Save a data scheme in the tool db
     *
     * @param scheme The scheme that should be saved
     * @param driver Neo4j driver
     */
    static async writeScheme(scheme: Scheme, driver: Driver) {
        const sess = driver.session({ database: process.env.DB_TOOL, defaultAccessMode: neo4j.session.WRITE });

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
    private static async writeLabel(l: Label, sess: Session) {
        // language=Cypher
        const query = `
          MERGE (l:LabelScheme {name: $labelName})
          SET l.color = $color, l.attributes = $attribs
          RETURN l AS label`;

        const params = {
            labelName: l.name,
            color: l.color,
            attribs: JSON.stringify(l.attributes),
        };

        return sess.run(query, params).catch(console.error);
    }

    /**
     * Write the scheme for one relation type into the tool DB
     *
     * @param r the scheme for the relation type to be saved
     * @param sess the session that is used to write into the DB
     * @private
     */
    private static async writeRelationType(r: RelationType, sess: Session) {
        // language=Cypher
        const query = `
          MERGE (r:RelationType {name: $labelName})
          SET r.attributes = $attribs, r.connections = $connects
          RETURN r AS relation`;

        const params = {
            labelName: r.name,
            attribs: JSON.stringify(r.attributes),
            connects: JSON.stringify(r.connections),
        };

        return sess.run(query, params).catch(console.error);
    }
}
