import { Module } from "@nestjs/common";
import { NodesService } from "./nodes.service";
import { NodesController } from "./nodes.controller";
import { DataSchemeService } from "../data-scheme/data-scheme.service";
import { DataSchemeUtil } from "../util/data-scheme.util";
import { UtilsNode } from "../util/utils.node";
import { NodesRelationsService } from "./nodes-relations.service";

@Module({
    providers: [NodesService, NodesRelationsService, DataSchemeService, DataSchemeUtil, UtilsNode],
    controllers: [NodesController],
})
export class NodesModule {}
