import * as dotenv from "dotenv";
import { SchemeSaver } from "./saver";
import { SchemeGenerator } from "./generator";
import { doWithDriver } from "./neo4jhelper";

// Load the .env config
dotenv.config();

// Save scheme
doWithDriver(async (driver) => {
    // Generate the data model scheme from the customer-database
    const scheme = await SchemeGenerator.getDataScheme(driver);

    // Write the scheme to the tool db
    await SchemeSaver.writeScheme(scheme, driver);
}).then(() => {
    console.log("Scheme written successfully!");
});
