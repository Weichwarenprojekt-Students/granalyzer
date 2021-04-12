import { Controller, Get, Param, Query } from "@nestjs/common";
import { NodesService } from "./nodes.service";
import Node from "./node.model";
import {
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from "@nestjs/swagger";
import { NodesRelationsService } from "./nodes-relations.service";
import Relation from "../relations/relation.model";

@ApiTags("nodes")
@Controller("nodes")
export class NodesController {
    constructor(
        private readonly nodesService: NodesService,
        private readonly nodesRelationsService: NodesRelationsService,
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

    @Get("/search/:needle")
    @ApiOperation({
        description: "Returns all nodes from the customer DB where the name contains the needle",
    })
    @ApiParam({
        name: "id",
        type: "string",
        description: "Identifier of the node which is requested",
    })
    @ApiOkResponse({
        description: "Return the nodes matching the needle",
        type: [Node],
    })
    @ApiInternalServerErrorResponse()
    searchNode(@Param("needle") name: string) {
        return this.nodesService.searchNode(name);
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
