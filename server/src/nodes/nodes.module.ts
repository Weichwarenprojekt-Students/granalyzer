import { Module } from "@nestjs/common";
import { NodesService } from "./nodes.service";
import { NodesController } from "./nodes.controller";
import { DataSchemeService } from "../data-scheme/data-scheme.service";
import { DataSchemeUtil } from "../util/data-scheme.util";
import { UtilsNode } from "../util/utils.node";

@Module({
    providers: [NodesService, DataSchemeService, DataSchemeUtil, UtilsNode],
    controllers: [NodesController],
})
export class NodesModule {}
