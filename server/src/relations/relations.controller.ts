import { RelationsService } from "./relations.service";
import { Controller, Get, Param } from "@nestjs/common";
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
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
}
