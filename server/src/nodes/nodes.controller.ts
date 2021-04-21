import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { NodesService } from "./nodes.service";
import Node from "./node.model";
import {
    ApiBody,
    ApiInternalServerErrorResponse,
    ApiNotAcceptableResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from "@nestjs/swagger";
import { NodesRelationsService } from "./nodes-relations.service";
import Relation from "../relations/relation.model";
import { ValidationPipe } from "../validation-pipe";

@ApiTags("nodes")
@Controller("nodes")
export class NodesController {
    constructor(
        private readonly nodesService: NodesService,
        private readonly nodesRelationsService: NodesRelationsService,
    ) {}

    @Post()
    @ApiOperation({ description: "Creates a new node with a new unique UUID" })
    @ApiOkResponse({ type: Node, description: "Returns the created node" })
    @ApiNotAcceptableResponse({ description: "Cannot create this node due to violated constraints" })
    @ApiBody({
        type: Node,
        description: "The node to be created",
    })
    createNode(@Body(ValidationPipe) body: Node) {
        return this.nodesService.createNode(body);
    }

    @Delete(":id")
    @ApiOperation({ description: "Deletes the specified node and all its relations" })
    @ApiOkResponse({ type: Node, description: "Returns the deleted node" })
    @ApiNotFoundResponse({ description: "Could not find any node for this uuid" })
    @ApiParam({
        name: "id",
        type: "string",
        description: "UUID of the node",
    })
    deleteNode(@Param("id") nodeId: string) {
        return this.nodesService.deleteNode(nodeId);
    }

    @Put(":id")
    @ApiOperation({ description: "Updates the attributes of the node" })
    @ApiOkResponse({ type: Node, description: "Returns the updated node" })
    @ApiNotFoundResponse({ description: "Could not find any node for this uuid" })
    @ApiNotAcceptableResponse({ description: "Cannot modify this node due to violated constraints" })
    @ApiParam({
        name: "id",
        type: "string",
        description: "UUID of the node",
    })
    @ApiBody({
        type: Node,
        description: "The node to be modified",
    })
    modifyNode(@Param("id") id: string, @Body(ValidationPipe) body: Node) {
        return this.nodesService.modifyNode(id, body);
    }

    @Get(":id")
    @ApiOperation({
        description: "Returns a specific node from the customer db matching by id",
    })
    @ApiOkResponse({
        description: "Return the node with the given id",
        type: Node,
    })
    @ApiInternalServerErrorResponse()
    getNode(@Param("id") id: string) {
        return this.nodesService.getNode(id);
    }

    @Get()
    @ApiQuery({ name: "limit", type: "number" })
    @ApiQuery({ name: "offset", type: "number" })
    @ApiQuery({ name: "nameFilter", type: "string" })
    @ApiQuery({ name: "labelFilter", type: "string[]" })
    @ApiOperation({
        description: `Returns all the node from the customer db with applying a limit, offset and filter - default limit is 20, default offset is 0`,
    })
    @ApiOkResponse({
        description: "Return the nodes",
        type: [Node],
    })
    @ApiInternalServerErrorResponse()
    getAllNodes(
        @Query("limit") limit?: number,
        @Query("offset") offset?: number,
        @Query("nameFilter") nameFilter?: string,
        @Query("labelFilter") labelFilter?: Array<string>,
    ) {
        limit = limit ?? 20;
        offset = offset ?? 0;
        nameFilter = nameFilter ?? "";
        labelFilter = labelFilter ?? [];
        return this.nodesService.getAllNodes(limit, offset, nameFilter, labelFilter);
    }

    @Get(":id/relations")
    @ApiOperation({
        description: "Return all relations that are connected to a node matching id",
    })
    @ApiParam({
        name: "id",
        type: "string",
        description: "Identifier of the node which relations are requested",
    })
    @ApiOkResponse({
        description: "Return the all relations of a node",
        type: [Relation],
    })
    getRelationsOfNode(@Param("id") id: string) {
        return this.nodesRelationsService.getRelationsOfNode(id);
    }
}
