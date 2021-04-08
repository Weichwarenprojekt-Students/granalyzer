import { Test } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";
import { Neo4jModule } from "nest-neo4j/dist";
import { UtilModule } from "./util.module";

export default class TestUtil {
    static createTestingModule(providers = [], controllers = [], imports = []) {
        function suffixDatabases(config: Record<string, unknown>) {
            config.DB_TOOL += "test";
            config.DB_CUSTOMER += "test";
            return config;
        }

        return Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    validate: suffixDatabases,
                }),
                Neo4jModule.forRoot({
                    scheme: "bolt",
                    host: process.env.DB_HOST,
                    port: process.env.DB_PORT,
                    username: process.env.DB_USERNAME,
                    password: process.env.DB_PASSWORD,
                }),
                UtilModule.forRoot(),
            ].concat(imports),
            controllers: [].concat(controllers),
            providers: [].concat(providers),
        }).compile();
    }

    /**
     * Defines the attribute to be sorted by
     * @param prop The name of the JSON attribute to be searched by
     */
    static getSortOrder(prop: string) {
        return function (a, b) {
            if (a[prop] > b[prop]) {
                return 1;
            } else if (a[prop] < b[prop]) {
                return -1;
            }
            return 0;
        };
    }
}
