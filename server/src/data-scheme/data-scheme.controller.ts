import { Controller, Get, Param } from "@nestjs/common";
import { DataSchemeService } from "./data-scheme.service";
import {
    ApiNotAcceptableResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from "@nestjs/swagger";
import { Scheme } from "./data-scheme.model";
import { Label } from "./models/label";
import { RelationType } from "./models/relationType";

@ApiTags("data-scheme")
@Controller("data-scheme")
export class DataSchemeController {
    constructor(private readonly dataSchemeService: DataSchemeService) {}

    @Get()
    @ApiOperation({
        description: "Returns complete data scheme",
    })
    @ApiOkResponse({
        description: "Returns complete data scheme",
        type: Scheme,
    })
    getScheme() {
        return this.dataSchemeService.getScheme();
    }

    @Get("/label")
    @ApiOperation({
        description: "Returns the schemes for all labels",
    })
    @ApiOkResponse({
        description: "Returns the schemes for all labels",
        type: [Label],
    })
    getAllLabels() {
        return this.dataSchemeService.getAllLabel();
    }

    @Get("/label/:id")
    @ApiOperation({
        description: "Returns a specific scheme for a label",
    })
    @ApiParam({
        name: "id",
        type: "string",
        description: "Identifier of the label scheme",
    })
    @ApiOkResponse({
        description: "Returns a specific scheme for a label",
        type: Label,
    })
    @ApiNotAcceptableResponse({
        description: "Requested resource is not a scheme for a label",
    })
    @ApiNotFoundResponse({
        description: "Requested resource does not exist",
    })
    getLabel(@Param("id") id: string) {
        return this.dataSchemeService.getLabel(id);
    }

    @Get("relation")
    @ApiOperation({
        description: "Returns the schemes for all relations",
    })
    @ApiOkResponse({
        description: "Returns the schemes for all relations",
        type: [RelationType],
    })
    getAllRelations() {
        return this.dataSchemeService.getAllRelations();
    }

    @Get("/relation/:id")
    @ApiOperation({
        description: "Returns a specific scheme for a relation",
    })
    @ApiParam({
        name: "id",
        type: "string",
        description: "Identifier of the relation scheme",
    })
    @ApiOkResponse({
        description: "Returns a specific scheme for a relation",
        type: RelationType,
    })
    @ApiNotAcceptableResponse({
        description: "Requested resource is not a scheme for a relation",
    })
    @ApiNotFoundResponse({
        description: "Requested resource does not exist",
    })
    getRelation(@Param("id") id: string) {
        return this.dataSchemeService.getRelation(id);
    }
}
