import Result from "neo4j-driver/types/result";
import ResultSummary from "neo4j-driver/types/result-summary";
import { QueryResult } from "neo4j-driver";

export class TestUtils {
    /**
     * Mock utility
     * Returns a valid noe4j response from the given data
     *
     * @param res
     */
    static mockDbResult(res: any[]): Result {
        const mock = {
            records: res.map((row) => ({
                keys: Object.keys(row),
                get: (key: string) => (row.hasOwnProperty(key) ? row[key] : null),
            })),
            summary: <ResultSummary>{},
        };

        return <Result>new Promise((resolve) => {
            resolve(<QueryResult>mock);
        });
    }
}
