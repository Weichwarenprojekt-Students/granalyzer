import { RelationsService } from "./relations.service";
import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import {
    ApiBody,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from "@nestjs/swagger";
import Relation from "./relation.model";
import { ValidationPipe } from "../validation-pipe";

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

    @Put(":id")
    @ApiOperation({ description: "Updates the attributes of the relation" })
    @ApiOkResponse({ description: "Returns the updated relation" })
    @ApiNotFoundResponse({ description: "Could not find any relation for this uuid" })
    @ApiParam({
        name: "id",
        type: "string",
        description: "UUID of the relation",
    })
    @ApiBody({
        type: Relation,
        description: "The relation to be modified",
    })
    modifyRelation(@Param("id") id: string, @Body(ValidationPipe) body: Relation) {
        return this.relationsService.modifyRelation(id, body);
    }
}
