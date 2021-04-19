import { Body, Controller, Get, Param, Put, Query } from "@nestjs/common";
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
import { NodesAttributesService } from "./nodes-attributes.service";

@ApiTags("nodes")
@Controller("nodes")
export class NodesController {
    constructor(
        private readonly nodesService: NodesService,
        private readonly nodesRelationsService: NodesRelationsService,
        private readonly nodesAttributesService: NodesAttributesService,
    ) {}

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

    @Put(":id/setAttributes")
    @ApiOperation({ description: "Updates the attributes of the node" })
    @ApiOkResponse({ type: Node, description: "Returns the updated node" })
    @ApiNotAcceptableResponse({ description: "Invalid node data" })
    @ApiNotFoundResponse({ description: "Requested node unavailable" })
    @ApiParam({
        name: "id",
        type: "string",
        description: "UUID of the node",
    })
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                nodeId: {
                    type: "string",
                    description: "The UUID of the node",
                },
                name: {
                    type: "string",
                    description: "The display-name of the node",
                },
                label: {
                    type: "string",
                    description: "The label of the node",
                },
                attributes: {
                    type: "any",
                    description: "The JSON object attributes",
                },
            },
        },
    })
    setAttributes(@Param("id") id: string, @Body() body: Node) {
        return this.nodesAttributesService.setAttributes(id, body);
    }
}
