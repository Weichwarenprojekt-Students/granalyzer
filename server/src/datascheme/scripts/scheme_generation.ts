import * as dotenv from "dotenv";
import { Saver } from "../saver";
import { SchemeGenerator } from "../SchemeGenerator";
import * as neo4j from "neo4j-driver";
import { Driver } from "neo4j-driver";

/**
 * Execute a function with an instance of the saver
 *
 * Automatically closes the neo4j driver connection which is needed for the scheme saver.
 *
 * @param fn The function to execute
 */
async function doWithDriver(fn: (driver: Driver) => void) {
    // Construct instance of this saver
    const driver = getDriver();

    // Execute the function
    await fn(driver);

    // Cleanup by closing the driver
    await driver.close();
}

/**
 * Get instance of a configured neo4j driver
 */
function getDriver() {
    return neo4j.driver(
        `bolt://${process.env.DB_HOST}:${process.env.DB_PORT}`,
        neo4j.auth.basic(process.env.DB_USERNAME, process.env.DB_PASSWORD),
    );
}

// Load the .env config
dotenv.config();

// Save scheme
doWithDriver(async (driver) => {
    // Generate the data model scheme from the customer-database
    const scheme = await SchemeGenerator.getDataScheme(driver);

    console.log(scheme);

    // Write the scheme to the tool db
    await Saver.writeScheme(scheme, driver);
}).then(() => {
    console.log("Scheme written successfully!");
});
