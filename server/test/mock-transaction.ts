import Transaction from "neo4j-driver/types/transaction";
import { Result } from "neo4j-driver";

export class MockTransaction implements Transaction {
    commit(): Promise<void> {
        return Promise.resolve(undefined);
    }

    isOpen(): boolean {
        return false;
    }

    rollback(): Promise<void> {
        return Promise.resolve(undefined);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run(query: string, parameters?: Parameters<any>): Result {
        return undefined;
    }
}
