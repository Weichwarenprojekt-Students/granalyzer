import { int, Transaction } from "neo4j-driver";

/**
 * Service stub which can be used to replace the neo4j service as a provider in unit tests
 */
export class MockNeo4jService {
    getDriver() {
        return;
    }

    getConfig() {
        return;
    }

    int(value: number) {
        return int(value);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    beginTransaction(database?: string) {
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getReadSession(database?: string) {
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getWriteSession(database?: string) {
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    read(cypher: string, params?: Record<string, any>, databaseOrTransaction?: string | Transaction) {
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    write(cypher: string, params?: Record<string, any>, databaseOrTransaction?: string | Transaction) {
        return;
    }

    onApplicationShutdown() {
        return;
    }
}
