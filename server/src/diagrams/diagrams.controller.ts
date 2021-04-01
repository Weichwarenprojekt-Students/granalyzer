import { Controller, Get, Param, Post, Body, Put, Delete } from "@nestjs/common";
import { DiagramsService } from "./diagrams.service";
import {
    ApiBody,
    ApiNotAcceptableResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from "@nestjs/swagger";
import { Diagram } from "./diagram.model";

@ApiTags("diagrams")
@Controller("diagrams")
export class DiagramsController {
    constructor(private readonly diagramsService: DiagramsService) {}

    @Get()
    @ApiOperation({
        description: "Returns all diagrams",
    })
    @ApiOkResponse({
        description: "Returns all diagrams",
        type: [Diagram],
    })
    getAllDiagrams() {
        return this.diagramsService.getDiagrams();
    }

    @Get("/root")
    @ApiOperation({
        description: "Return all diagrams at top level (which are not nested into another folder)",
    })
    @ApiOkResponse({
        description: "Returns all diagrams at root level",
        type: [Diagram],
    })
    getAllRootDiagrams() {
        return this.diagramsService.getAllRootDiagrams();
    }

    @Get(":id")
    @ApiOperation({
        description: "Returns the specific diagram represented by the given id",
    })
    @ApiParam({
        name: "id",
        type: "number",
        description: "Identifier of the diagram which is requested",
    })
    @ApiOkResponse({
        type: Diagram,
        description: "Returns the specific diagram represented by the given id",
    })
    @ApiNotAcceptableResponse({ description: "Requested resource is not a diagram" })
    @ApiNotFoundResponse({ description: "Requested resource does not exist" })
    getDiagram(@Param("id") id: number) {
        return this.diagramsService.getDiagram(id);
    }

    @Post()
    @ApiOperation({
        description: "Adds a new diagram",
    })
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "Name of the new diagram",
                },
                serialized: {
                    type: "string",
                    description: "Serialized JSON object of diagram",
                },
            },
        },
    })
    @ApiOkResponse({
        type: Diagram,
        description: "Returns the added diagram",
    })
    addDiagram(@Body() body: Diagram) {
        return this.diagramsService.addDiagram(body.name, body.serialized);
    }

    @Put(":id")
    @ApiOperation({
        description: "Updates an existing diagram",
    })
    @ApiOkResponse({
        type: Diagram,
        description: "Updates an existing diagram by id",
    })
    @ApiNotAcceptableResponse({ description: "Requested resource is not a diagram" })
    @ApiNotFoundResponse({ description: "Requested resource does not exist" })
    @ApiParam({
        name: "id",
        type: "number",
        description: "Identifier of the diagram which should be updated",
    })
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "New name",
                },
            },
        },
    })
    updateDiagram(@Param("id") id: number, @Body("name") name: string) {
        return this.diagramsService.updateDiagram(id, name);
    }

    @Delete(":id")
    @ApiOperation({
        description: "Deletes the diagram with the given id",
    })
    @ApiParam({
        name: "id",
        type: "number",
        description: "Identifier of the diagram which should be deleted",
    })
    @ApiOkResponse({
        type: Diagram,
        description: "Returns the deleted diagram",
    })
    @ApiNotAcceptableResponse({ description: "Requested resource is not a diagram" })
    @ApiNotFoundResponse({ description: "Requested resource does not exist" })
    deleteDiagram(@Param("id") id: number) {
        return this.diagramsService.deleteDiagram(id);
    }
}
