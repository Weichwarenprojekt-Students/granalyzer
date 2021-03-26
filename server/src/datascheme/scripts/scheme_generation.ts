import * as dotenv from "dotenv";
import { Saver } from "../saver";
import { SchemeGenerator } from "../SchemeGenerator";

// Load the .env config
dotenv.config();

const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_CUSTOMER;

// Generate a new scheme generator
const service = new SchemeGenerator(host, port, username, password, database);

// Generate the data model scheme from the customer-database
service.openDBConnection();
const scheme = service.getDataScheme();

// Save scheme
Saver.doWithDriver(async (saver) => {
    await saver.writeScheme(await scheme);
}).then(() => {
    service.closeDBConnection();
    console.log("Scheme written successfully!");
});
