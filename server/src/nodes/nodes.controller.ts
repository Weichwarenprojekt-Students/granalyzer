import { Controller, Get, Param, Query } from "@nestjs/common";
import { NodesService } from "./nodes.service";
import Node from "./node.model";
import { ApiInternalServerErrorResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

@ApiTags("nodes")
@Controller("nodes")
export class NodesController {
    constructor(private readonly nodesService: NodesService) {}

    @Get()
    @ApiQuery({ name: "limit", type: "number" })
    @ApiQuery({ name: "offset", type: "number" })
    @ApiOperation({
        description: "Returns all the node from the customer db with applying a limit and offset",
    })
    @ApiOkResponse({
        description: "Return the nodes",
        type: [Node],
    })
    @ApiInternalServerErrorResponse()
    getAllNodes(@Query("limit") limit?: number, @Query("offset") offset?: number) {
        limit = limit ?? 20;
        offset = offset ?? 0;
        return this.nodesService.getAllNodes(limit, offset);
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
    getNode(@Param("id") id: number) {
        return this.nodesService.getNode(id);
    }

    @Get("/search/:needle")
    @ApiOperation({
        description: "Returns all nodes from the customer DB where the name contains the needle",
    })
    @ApiOkResponse({
        description: "Return the nodes matching the needle",
        type: [Node],
    })
    @ApiInternalServerErrorResponse()
    searchNode(@Param("needle") name: string) {
        return this.nodesService.searchNode(name);
    }
}
