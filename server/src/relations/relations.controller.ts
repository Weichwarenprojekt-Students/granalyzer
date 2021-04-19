import { RelationsService } from "./relations.service";
import { Body, Controller, Get, Param, Put } from "@nestjs/common";
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
import { RelationsAttributesService } from "./relations-attributes.service";

@ApiTags("relations")
@Controller("relations")
export class RelationsController {
    constructor(
        private readonly relationsService: RelationsService,
        private readonly relationAttributesService: RelationsAttributesService,
    ) {}

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

    @Put(":id/setAttributes")
    @ApiOperation({ description: "Updates the attributes of the relation" })
    @ApiOkResponse({ description: "Returns the updated relation" })
    @ApiNotAcceptableResponse({ description: "Invalid relation data" })
    @ApiNotFoundResponse({ description: "Requested relation unavailable" })
    @ApiParam({
        name: "id",
        type: "string",
        description: "UUID of the relation",
    })
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                relationId: {
                    type: "string",
                    description: "The UUID of the relation",
                },

                type: {
                    type: "string",
                    description: "The type of the relation",
                },

                attributes: {
                    type: "any",
                    description: "The JSON object attributes",
                },

                from: {
                    type: "string",
                    description: "The UUID of the source node",
                },

                to: {
                    type: "string",
                    description: "The UUID of the target node",
                },
            },
        },
    })
    setAttributes(@Param("id") id: string, @Body() body: Relation) {
        return this.relationAttributesService.setAttributes(id, body);
    }
}
