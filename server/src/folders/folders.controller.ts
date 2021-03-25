import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { FoldersService } from "./folders.service";
import {
    ApiBody,
    ApiNotAcceptableResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from "@nestjs/swagger";
import { Folder } from "./folder.model";
import { Diagram } from "../diagrams/diagram.model";

@ApiTags("folders")
@Controller("folders")
export class FoldersController {
    constructor(private readonly foldersService: FoldersService) {}

    @Get("/children")
    @ApiOperation({
        description: "Return all folders and diagrams at top level (which are not nested into another folder)",
    })
    @ApiOkResponse({
        description: "Returns all folders and diagrams at root level",
        type: "array",
    })
    getAllRootElements() {
        return this.foldersService.getAllRootElements();
    }

    @Get()
    @ApiOperation({
        description: "Returns all folders",
    })
    @ApiOkResponse({
        description: "Returns all folders",
        type: [Folder],
    })
    getAllFolders() {
        return this.foldersService.getAllFolders();
    }

    @Get(":id")
    @ApiOperation({
        description: "Returns a specific folder",
    })
    @ApiOkResponse({
        description: "Returns the folder",
        type: Folder,
    })
    @ApiNotAcceptableResponse({ description: "Requested resource is not a folder" })
    @ApiNotFoundResponse({ description: "Requested resource does not exist" })
    getFolder(@Param("id") id: number) {
        return this.foldersService.getFolder(id);
    }

    @Put(":id")
    @ApiOperation({
        description: "Updates the folder with the given id",
    })
    @ApiOkResponse({
        description: "Returns the folder which was updated",
        type: Folder,
    })
    @ApiNotAcceptableResponse({ description: "Requested resource is not a folder" })
    @ApiNotFoundResponse({ description: "Requested resource does not exist" })
    @ApiParam({
        name: "id",
        type: "number",
        description: "The identifier of the diagram",
    })
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "New name of the folder",
                },
            },
        },
    })
    updateFolder(@Param("id") id: number, @Body("name") name: string) {
        return this.foldersService.updateFolder(id, name);
    }

    @Post()
    @ApiOperation({
        description: "Adds a new folder",
    })
    @ApiOkResponse({
        description: "Returns the folder which was created",
        type: Folder,
    })
    @ApiNotAcceptableResponse({ description: "Requested resource is not a folder" })
    @ApiNotFoundResponse({ description: "Requested resource does not exist" })
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "The name of the new folder",
                },
            },
        },
    })
    addFolder(@Body("name") name: string) {
        return this.foldersService.addFolder(name);
    }

    @Delete(":id")
    @ApiOperation({
        description: "Deletes the folder with the given id",
    })
    @ApiOkResponse({
        description: "Returns the folder which was deleted",
        type: Folder,
    })
    @ApiNotAcceptableResponse({ description: "Requested resource is not a folder" })
    @ApiNotFoundResponse({ description: "Requested resource does not exist" })
    @ApiParam({
        name: "id",
        type: "number",
        description: "Identifier of the diagram",
    })
    deleteFolder(@Param("id") id: number) {
        return this.foldersService.deleteFolder(id);
    }

    @Get(":id/children")
    @ApiOperation({
        description: "Returns all children elements of the folder with the given id",
    })
    @ApiOkResponse({
        type: "array",
        description: "Array of diagrams and folders",
    })
    @ApiNotAcceptableResponse({ description: "Requested resource is not a folder" })
    @ApiNotFoundResponse({ description: "Requested resource does not exist" })
    getChildrenOfFolder(@Param("id") id: number) {
        return this.foldersService.getChildrenOfFolder(id);
    }

    @Get(":id/children/:childId")
    @ApiOperation({
        description: "Returns the specific children of the folder",
    })
    @ApiOkResponse({
        type: Object,
        description: "Either a Diagram or a Folder",
    })
    @ApiNotAcceptableResponse({ description: "Requested resource is not a folder" })
    @ApiNotFoundResponse({ description: "Requested resource does not exist" })
    @ApiParam({
        name: "id",
        type: "number",
        description: "Id of the folder which contains the child",
    })
    @ApiParam({
        name: "childId",
        type: "number",
        description: "The id of the specified children",
    })
    getChildOfFolder(@Param("id") id: number, @Param("childId") childId: number) {
        return this.foldersService.getChildOfFolder(id, childId);
    }

    @Post(":id/children/:childId")
    @ApiOperation({
        description: "Adds a children with the child id as child of the specified folder",
    })
    @ApiOkResponse({
        type: Object,
        description: "The added child element; Either a Diagram or a Folder",
    })
    @ApiNotAcceptableResponse({ description: "Requested resource is not a folder" })
    @ApiNotFoundResponse({ description: "Requested resource does not exist" })
    @ApiParam({
        name: "id",
        type: "number",
        description: "The folder id to which the child should be added",
    })
    @ApiParam({
        name: "childId",
        type: "number",
        description: "The id of the child element which should be added to the folder",
    })
    addChildToFolder(@Param("id") id: number, @Param("childId") childId: number) {
        return this.foldersService.addChildToFolder(id, childId);
    }

    @Delete(":id/children/:childId")
    @ApiOperation({
        description: "Removes a children with the child id as child from the specified folder",
    })
    @ApiOkResponse({
        type: "object",
        description: "The removed child element; Either a Diagram or a Folder",
    })
    @ApiNotAcceptableResponse({ description: "Requested resource is not a folder" })
    @ApiNotFoundResponse({ description: "Requested resource does not exist" })
    @ApiParam({
        name: "id",
        type: "number",
        description: "The folder id from which the specific child should be removed",
    })
    @ApiParam({
        name: "childId",
        type: "number",
        description: "The id of the child element which should be deleted from the folder",
    })
    removeChildFromFolder(@Param("id") id: number, @Param("childId") childId: number) {
        return this.foldersService.removeChildFromFolder(id, childId);
    }
}
