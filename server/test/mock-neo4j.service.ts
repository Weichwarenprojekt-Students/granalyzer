import { int as neo4jInt, Transaction } from "neo4j-driver";
import { MockTransaction } from "./mock-transaction";

/**
 * Service stub which can be used to replace the neo4j service as a provider in unit tests
 */
const MockNeo4jService = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getDriver() {
        return;
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getConfig() {
        return;
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    int(value: number) {
        return neo4jInt(value);
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    beginTransaction(database?: string) {
        return new MockTransaction();
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getReadSession(database?: string) {
        return;
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getWriteSession(database?: string) {
        return;
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    read(cypher: string, params?: Record<string, any>, databaseOrTransaction?: string | Transaction) {
        return;
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    write(cypher: string, params?: Record<string, any>, databaseOrTransaction?: string | Transaction) {
        return;
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onApplicationShutdown() {
        return;
    },
};

export default MockNeo4jService;
