import { RelationsService } from "./relations.service";
import { Body, Controller, Delete, Get, Param, Put } from "@nestjs/common";
import {
    ApiBody,
    ApiInternalServerErrorResponse,
    ApiNotAcceptableResponse,
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

    @Get(":id")
    @ApiOperation({ description: "Returns a specific relation from the customer db matching by id" })
    @ApiOkResponse({ description: "Return the relation with the given id", type: Relation })
    @ApiInternalServerErrorResponse()
    getRelation(@Param("id") id: string) {
        return this.relationsService.getRelation(id);
    }

    @Get()
    @ApiOperation({
        description: "Returns all the relations from the customer db",
    })
    @ApiOkResponse({ description: "Return the relations", type: [Relation] })
    @ApiInternalServerErrorResponse()
    getAllRelations() {
        return this.relationsService.getAllRelations();
    }

    @Put(":id")
    @ApiOperation({ description: "Updates the attributes of the relation" })
    @ApiOkResponse({ description: "Returns the updated relation", type: Relation })
    @ApiNotFoundResponse({ description: "Could not find any relation for this uuid" })
    @ApiNotAcceptableResponse({ description: "Cannot modify this relation due to violated constraints" })
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

    @Delete(":id")
    @ApiOperation({ description: "Deletes the specified relation" })
    @ApiOkResponse({ description: "Returns the deleted relation", type: Relation })
    @ApiNotFoundResponse({ description: "Could not find any relation for this uuid" })
    @ApiParam({
        name: "relationId",
        type: "string",
        description: "UUID of the relation",
    })
    deleteRelation(@Param("id") relationId: string): Promise<Relation> {
        return this.relationsService.deleteRelation(relationId);
    }
}
