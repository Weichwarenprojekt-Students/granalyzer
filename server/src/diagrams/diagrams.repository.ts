import * as neo4j from "neo4j-driver";
import Result from "neo4j-driver/types/result";
import ResultSummary from "neo4j-driver/types/result-summary";
import { QueryResult } from "neo4j-driver";

export class DiagramsRepository {
    /**
     * Mock utility
     * Returns a valid noe4j response from the given data
     *
     * @param res
     * @private
     */
    private static mockDbResult(res: any[]): Result {
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

    /**
     * Returns mocked db data
     */
    static mockGetDiagrams() {
        return this.mockDbResult([
            {
                diagram: {
                    identity: neo4j.int(0),
                    properties: {
                        name: "diagram 1",
                    },
                },
            },
            {
                diagram: {
                    identity: neo4j.int(1),
                    properties: {
                        name: "diagram 2",
                    },
                },
            },
        ]);
    }

    /**
     * Predicted response from get all diagrams
     */
    static resultGetDiagrams() {
        return [
            {
                id: 0,
                name: "diagram 1",
            },
            {
                id: 1,
                name: "diagram 2",
            },
        ];
    }
}
