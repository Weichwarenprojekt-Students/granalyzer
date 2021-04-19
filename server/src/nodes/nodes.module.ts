import { Module } from "@nestjs/common";
import { NodesService } from "./nodes.service";
import { NodesController } from "./nodes.controller";
import { DataSchemeService } from "../data-scheme/data-scheme.service";
import { NodesRelationsService } from "./nodes-relations.service";
import { NodesAttributesService } from "./nodes-attributes.service";

@Module({
    providers: [NodesService, NodesRelationsService, NodesAttributesService, DataSchemeService],
    controllers: [NodesController],
})
export class NodesModule {}
