import { Controller, Get, Query } from "@nestjs/common";
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
}
