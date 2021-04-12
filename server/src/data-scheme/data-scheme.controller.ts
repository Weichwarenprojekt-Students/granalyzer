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
import { LabelScheme } from "./models/labelScheme";
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
        type: [LabelScheme],
    })
    getAllLabelSchemes() {
        return this.dataSchemeService.getAllLabelSchemes();
    }

    @Get("/label/:name")
    @ApiOperation({
        description: "Returns a specific scheme for a label",
    })
    @ApiParam({
        name: "name",
        type: "string",
        description: "Unique name of the label scheme",
    })
    @ApiOkResponse({
        description: "Returns a specific scheme for a label",
        type: LabelScheme,
    })
    @ApiNotAcceptableResponse({
        description: "Requested resource is not a scheme for a label",
    })
    @ApiNotFoundResponse({
        description: "Requested resource does not exist",
    })
    getLabelScheme(@Param("name") name: string) {
        return this.dataSchemeService.getLabelScheme(name);
    }

    @Get("relation")
    @ApiOperation({
        description: "Returns the schemes for all relations",
    })
    @ApiOkResponse({
        description: "Returns the schemes for all relations",
        type: [RelationType],
    })
    getAllRelationTypes() {
        return this.dataSchemeService.getAllRelationTypes();
    }

    @Get("/relation/:name")
    @ApiOperation({
        description: "Returns a specific scheme for a relation",
    })
    @ApiParam({
        name: "name",
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
    getRelationType(@Param("name") name: string) {
        return this.dataSchemeService.getRelationType(name);
    }
}
