import { Body, Controller, Delete, forwardRef, Get, Inject, Param, Post, Put } from "@nestjs/common";
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
import { DiagramsService } from "../diagrams/diagrams.service";
import { ValidationPipe } from "../validation-pipe";

@ApiTags("folders")
@Controller("folders")
export class FoldersController {
    constructor(
        private readonly foldersService: FoldersService,
        @Inject(forwardRef(() => DiagramsService)) private diagramsService: DiagramsService,
    ) {}

    @Get("/root")
    @ApiOperation({
        description: "Return all folders at top level (which are not nested into another folder)",
    })
    @ApiOkResponse({
        description: "Returns all folders at root level",
        type: [Folder],
    })
    getAllRootFolders() {
        return this.foldersService.getAllRootFolders();
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
    getFolder(@Param("id") id: string) {
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
        type: "string",
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
    updateFolder(@Param("id") id: string, @Body(ValidationPipe) folder: Folder) {
        return this.foldersService.updateFolder(id, folder.name);
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
    addFolder(@Body(ValidationPipe) folder: Folder) {
        return this.foldersService.addFolder(folder.name);
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
        type: "string",
        description: "Identifier of the diagram",
    })
    deleteFolder(@Param("id") id: string) {
        return this.foldersService.deleteFolder(id);
    }

    @Get(":id/folders")
    @ApiOperation({
        description: "Returns all folder which are in the folder with the given id",
    })
    @ApiOkResponse({
        type: [Folder],
        description: "Array of folders",
    })
    @ApiNotAcceptableResponse({ description: "Requested resource is not a folder" })
    @ApiNotFoundResponse({ description: "Requested resource does not exist" })
    getFoldersInFolder(@Param("id") id: string) {
        return this.foldersService.getFoldersInFolder(id);
    }

    @Post(":parentId/folders")
    @ApiOperation({
        description: "Adds a new folder inside of the folder with the given id",
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
    createFolderInFolder(@Body(ValidationPipe) folder: Folder, @Param("parentId") parentId: string) {
        return this.foldersService.addFolderInFolder(parentId, folder.name);
    }

    @Get(":id/folders/:childId")
    @ApiOperation({
        description: "Returns the specific child folder of the given folder",
    })
    @ApiOkResponse({
        type: Folder,
        description: "The requested child folder Folder",
    })
    @ApiNotAcceptableResponse({ description: "Requested resource is not a folder" })
    @ApiNotFoundResponse({ description: "Requested resource does not exist" })
    @ApiParam({
        name: "id",
        type: "string",
        description: "Id of the folder which contains the child",
    })
    @ApiParam({
        name: "childId",
        type: "string",
        description: "The id of the specified child folder",
    })
    getFolderInFolder(@Param("id") id: string, @Param("childId") childId: string) {
        return this.foldersService.getFolderInFolder(id, childId);
    }

    @Put(":id/folders/:childId")
    @ApiOperation({
        description: "Adds a folder with the child id as child of the specified folder",
    })
    @ApiOkResponse({
        type: Folder,
        description: "The added folder",
    })
    @ApiNotAcceptableResponse({ description: "Requested resource is not a folder" })
    @ApiNotFoundResponse({ description: "Requested resource does not exist" })
    @ApiParam({
        name: "id",
        type: "string",
        description: "The folder id to which the child folder should be added",
    })
    @ApiParam({
        name: "childId",
        type: "string",
        description: "The id of the child folder which should be added to the folder",
    })
    moveFolderToFolder(@Param("id") id: string, @Param("childId") childId: string) {
        return this.foldersService.moveFolderToFolder(id, childId);
    }

    @Delete(":id/folders/:childId")
    @ApiOperation({
        description: "Removes a folder with the child id as child from the specified folder",
    })
    @ApiOkResponse({
        type: Folder,
        description: "The removed child folder",
    })
    @ApiNotAcceptableResponse({ description: "Requested resource is not a folder" })
    @ApiNotFoundResponse({ description: "Requested resource does not exist" })
    @ApiParam({
        name: "id",
        type: "string",
        description: "The folder id from which the specific child folder should be removed",
    })
    @ApiParam({
        name: "childId",
        type: "string",
        description: "The id of the child folder which should be deleted from the parent folder",
    })
    removeFolderFromFolder(@Param("id") id: string, @Param("childId") childId: string) {
        return this.foldersService.removeFolderFromFolder(id, childId);
    }

    @Get(":id/diagrams")
    @ApiOperation({
        description: "Returns all child diagrams of the folder with the given id",
    })
    @ApiParam({
        name: "id",
        type: "string",
        description: "The folder id",
    })
    @ApiOkResponse({
        type: [Diagram],
        description: "Array of diagrams",
    })
    @ApiNotAcceptableResponse({ description: "Requested resource is not a folder" })
    @ApiNotFoundResponse({ description: "Requested resource does not exist" })
    getDiagramsInFolder(@Param("id") id: string) {
        return this.diagramsService.getDiagramsInFolder(id);
    }

    @Get(":id/diagrams/:childId")
    @ApiOperation({
        description: "Returns the specific child diagram of the folder",
    })
    @ApiOkResponse({
        type: Diagram,
        description: "The child diagram",
    })
    @ApiNotAcceptableResponse({ description: "Requested resource is not a folder" })
    @ApiNotFoundResponse({ description: "Requested resource does not exist" })
    @ApiParam({
        name: "id",
        type: "string",
        description: "Id of the folder which contains the child",
    })
    @ApiParam({
        name: "childId",
        type: "string",
        description: "The id of the specified children",
    })
    getDiagramInFolder(@Param("id") id: string, @Param("childId") childId: string) {
        return this.diagramsService.getDiagramInFolder(id, childId);
    }

    @Put(":id/diagrams/:childId")
    @ApiOperation({
        description: "Adds a child diagram with the child id as child of the specified folder",
    })
    @ApiOkResponse({
        type: Diagram,
        description: "The diagram which was added as a child",
    })
    @ApiNotAcceptableResponse({ description: "Requested resource is not a folder" })
    @ApiNotFoundResponse({ description: "Requested resource does not exist" })
    @ApiParam({
        name: "id",
        type: "string",
        description: "The folder id to which the child should be added",
    })
    @ApiParam({
        name: "childId",
        type: "string",
        description: "The id of the diagram which should be added to the folder",
    })
    moveDiagramToFolder(@Param("id") id: string, @Param("childId") childId: string) {
        return this.diagramsService.moveDiagramToFolder(id, childId);
    }

    @Delete(":id/diagrams/:childId")
    @ApiOperation({
        description: "Removes a diagram with the child id as child from the specified folder",
    })
    @ApiOkResponse({
        type: Diagram,
        description: "The removed child diagram",
    })
    @ApiNotAcceptableResponse({ description: "Requested resource is not a folder" })
    @ApiNotFoundResponse({ description: "Requested resource does not exist" })
    @ApiParam({
        name: "id",
        type: "string",
        description: "The folder id from which the specific child should be removed",
    })
    @ApiParam({
        name: "childId",
        type: "string",
        description: "The id of the child element which should be deleted from the folder",
    })
    removeDiagramFromFolder(@Param("id") id: string, @Param("childId") childId: string) {
        return this.diagramsService.removeDiagramFromFolder(id, childId);
    }
}
