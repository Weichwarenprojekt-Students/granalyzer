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
export class UtilsNode {
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
     * Checks whether the element with the given id is an entity of a given type
     *
     * @throws NotFoundException If no Element with the given ID exists
     * @throws NotAcceptableException If it is not an entity of the given type
     * @param label The label for which the element is going to be checked
     * @param id The ID of the element which is going to be checked
     */
    async checkElementForLabel(id: number, label: string) {
        // language=Cypher
        const cypher = `
          MATCH (f)
            WHERE id(f) = $id
          RETURN labels(f) AS label`;

        const params = {
            id: this.neo4jService.int(id),
        };

        return this.neo4jService.read(cypher, params, this.database).then((res) => {
            if (!res.records.length) {
                throw new NotFoundException(`Element with id: ${id} not found`);
            } else if (!(res.records[0].get("label").indexOf(label) > -1)) {
                throw new NotAcceptableException(`ID does not belong to a ${label}.`);
            }
            return;
        });
    }

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
    }
}
