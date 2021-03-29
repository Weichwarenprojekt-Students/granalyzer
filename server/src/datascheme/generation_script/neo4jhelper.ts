import { Driver } from "neo4j-driver";
import * as neo4j from "neo4j-driver";

/**
 * Execute a function with an instance of the saver
 *
 * Automatically closes the neo4j driver connection which is needed for the scheme saver.
 *
 * @param fn The function to execute
 */
export async function doWithDriver(fn: (driver: Driver) => void) {
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
