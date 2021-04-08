import { Module } from "@nestjs/common";
import { NodesService } from "./nodes.service";
import { NodesController } from "./nodes.controller";
import { DataSchemeService } from "../data-scheme/data-scheme.service";
import { DataSchemeUtil } from "../util/data-scheme.util";
import { NodeUtil } from "../util/node.util";
import { NodesRelationsService } from "./nodes-relations.service";

@Module({
    providers: [NodesService, NodesRelationsService, DataSchemeService, DataSchemeUtil, NodeUtil],
    controllers: [NodesController],
})
export class NodesModule {}
