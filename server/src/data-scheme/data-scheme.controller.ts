import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseBoolPipe,
    Post,
    Put,
    Query,
} from "@nestjs/common";
import { DataSchemeService } from "./data-scheme.service";
import {
    ApiBody,
    ApiCreatedResponse,
    ApiNotAcceptableResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from "@nestjs/swagger";
import { Scheme } from "./data-scheme.model";
import { LabelScheme } from "./models/label-scheme.model";
import { RelationType } from "./models/relation-type.model";
import { ValidationPipe } from "../validation-pipe";

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
    getLabelScheme(@Param("name") name) {
        return this.dataSchemeService.getLabelScheme(name);
    }

    @Post("/label")
    @ApiOperation({
        description: "Adds a new label",
    })
    @ApiBody({
        type: LabelScheme,
        description: "The label that should be added",
    })
    @ApiCreatedResponse({
        type: LabelScheme,
        description: "Returns the new label",
    })
    addLabelScheme(@Body(ValidationPipe) body: LabelScheme) {
        return this.dataSchemeService.addLabelScheme(body);
    }

    @Put("/label/:name")
    @ApiQuery({ name: "force", type: "boolean", required: true })
    @ApiOperation({
        description: "Updates a label",
    })
    @ApiParam({
        name: "name",
        type: "string",
        description: "Unique name of the label scheme",
    })
    @ApiBody({
        type: LabelScheme,
        description: "The updated label",
    })
    @ApiCreatedResponse({
        type: LabelScheme,
        description: "Returns the updated label",
    })
    updateLabelScheme(
        @Param("name") name,
        @Body(ValidationPipe) body: LabelScheme,
        @Query("force", new DefaultValuePipe(false), ParseBoolPipe) force,
    ) {
        return this.dataSchemeService.updateLabelScheme(name, body, force);
    }

    @Delete("/label/:name")
    @ApiOperation({
        description: "Deletes the label with the given name",
    })
    @ApiParam({
        name: "name",
        type: "string",
        description: "Identifier of the label",
    })
    @ApiCreatedResponse({
        type: LabelScheme,
        description: "Returns the deleted label",
    })
    @ApiNotFoundResponse({
        description: "The label does not exist",
    })
    deleteLabelScheme(@Param("name") name) {
        return this.dataSchemeService.deleteLabelScheme(name);
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
    getRelationType(@Param("name") name) {
        return this.dataSchemeService.getRelationType(name);
    }

    @Post("/relation")
    @ApiOperation({
        description: "Adds a new relation type",
    })
    @ApiBody({
        type: RelationType,
        description: "The relation type that should be added",
    })
    @ApiCreatedResponse({
        type: RelationType,
        description: "Returns the added relation type",
    })
    addRelationType(@Body(ValidationPipe) body: RelationType) {
        return this.dataSchemeService.addRelationType(body);
    }

    @Put("/relation/:name")
    @ApiQuery({ name: "force", type: "boolean", required: true })
    @ApiOperation({
        description: "Updates a relation type",
    })
    @ApiParam({
        name: "name",
        type: "string",
        description: "Unique name of the relation type scheme",
    })
    @ApiBody({
        type: RelationType,
        description: "The updated relation type",
    })
    @ApiCreatedResponse({
        type: RelationType,
        description: "Returns the updated relation type",
    })
    updateRelationType(
        @Param("name") name,
        @Body(ValidationPipe) body: RelationType,
        @Query("force", new DefaultValuePipe(false), ParseBoolPipe) force,
    ) {
        return this.dataSchemeService.updateRelationType(name, body, force);
    }

    @Delete("/relation/:name")
    @ApiOperation({
        description: "Deletes the relation type with the given name",
    })
    @ApiParam({
        name: "name",
        type: "string",
        description: "Identifier of the relation type",
    })
    @ApiCreatedResponse({
        type: RelationType,
        description: "Returns the deleted relation type",
    })
    @ApiNotFoundResponse({
        description: "The relation type does not exist",
    })
    deleteRelationType(@Param("name") name) {
        return this.dataSchemeService.deleteRelationType(name);
    }
}
