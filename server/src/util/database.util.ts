import { Neo4jService } from "nest-neo4j/dist";
import {
    HttpException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotAcceptableException,
    NotFoundException,
} from "@nestjs/common";

@Injectable()
export class DatabaseUtil {
    constructor(private readonly neo4jService: Neo4jService) {}

    /**
     * For node specific utility the tool DB should be used
     */
    private readonly database = process.env.DB_TOOL;

    /**
     * Logging instance with class context
     * @private
     */
    private readonly logger = new Logger(Neo4jService.name);

    /**
     * @param err
     * @private
     */
    catchDbError(err: Error) {
        // Pass Nestjs HttpException forward
        if (err instanceof HttpException) throw err;

        // Catch neo4j errors
        this.logger.error(err.message, err.stack);
        throw new InternalServerErrorException();

        // Necessary to avoid void return value of function
        return null;
    }
}
