import { Controller, Get, Param, Query } from "@nestjs/common";
import { NodesService } from "./nodes.service";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";

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
    getAllNodes(@Query("limit") limit: number, @Query("offset") offset: number) {
        return this.nodesService.getAllNodes(limit, offset);
    }

    @ApiOperation({
        description: "Returns the node from the customer DB where the name is like name",
    })
    @Get(":name")
    getNode(@Param("name") name: string) {
        return this.nodesService.getNode(name);
    }

    @ApiOperation({
        description: "Returns all nodes from the customer DB where the name contains the needle",
    })
    @Get("/search/:needle")
    searchNode(@Param("needle") name: string) {
        return this.nodesService.searchNode(name);
    }
}
