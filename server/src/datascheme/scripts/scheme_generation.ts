import * as dotenv from "dotenv";
import { Saver } from "../saver";
import { Scheme } from "../models/scheme";
import { Label } from "../models/label";
import { NumberAttribute, StringAttribute } from "../models/attributes";
import { RelationType } from "../models/relationType";
import { Connection } from "../models/connection";

// Load .env file
dotenv.config();

// generate scheme
const scheme = new Scheme(
    [
        new Label("Movie", "#06F", [new NumberAttribute("released")]),
        new Label("Person", "#fff", [new StringAttribute("name", true, "Max Mustermann")]),
    ],
    [new RelationType("WATCHED", [], [new Connection("Person", "Movie")])],
);

// Save scheme
Saver.doWithDriver(async (saver) => {
    await saver.writeScheme(scheme);
}).then(() => console.log("Scheme written successfully!"));
