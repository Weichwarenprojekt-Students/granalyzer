import { Module } from "@nestjs/common";
import { NodesService } from "./nodes.service";
import { NodesController } from "./nodes.controller";
import { DataSchemeService } from "../data-scheme/data-scheme.service";
import { NodesRelationsService } from "./nodes-relations.service";

@Module({
    providers: [NodesService, NodesRelationsService, DataSchemeService],
    controllers: [NodesController],
})
export class NodesModule {}
