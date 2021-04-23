import { RelationsService } from "./relations.service";
import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBody, ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import Relation from "./relation.model";

@ApiTags("relations")
@Controller("relations")
export class RelationsController {
    constructor(private readonly relationsService: RelationsService) {}

    @Get()
    @ApiOperation({
        description: "Returns all the relations from the customer db",
    })
    @ApiOkResponse({ description: "Return the relations", type: [Relation] })
    @ApiInternalServerErrorResponse()
    getAllRelations() {
        return this.relationsService.getAllRelations();
    }

    @Get(":id")
    @ApiOperation({ description: "Returns a specific relation from the customer db matching by id" })
    @ApiOkResponse({ description: "Return the relation with the given id", type: Relation })
    @ApiInternalServerErrorResponse()
    getRelation(@Param("id") id: string) {
        return this.relationsService.getRelation(id);
    }

    @Post()
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                type: {
                    type: "string",
                    description: "Type of the relation",
                },
                from: {
                    type: "string",
                    description: "Id of the node the relation is coming from",
                },
                to: {
                    type: "string",
                    description: "Id of the node the relation is coming from",
                },
            },
        },
    })
    @ApiOperation({ description: "Creates a relation between two nodes" })
    @ApiOkResponse({ description: "Returns the created relation", type: Relation })
    createRelation(@Body() body: Relation): Promise<Relation> {
        return this.relationsService.addRelation(body.type, body.from, body.to);
    }
}
