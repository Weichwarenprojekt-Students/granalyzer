import { Module } from "@nestjs/common";
import { DiagramsController } from "./diagrams.controller";
import { DiagramsService } from "./diagrams.service";
import { UtilsNode } from "../util/utils.node";

@Module({
    controllers: [DiagramsController],
    providers: [DiagramsService, UtilsNode],
})
export class DiagramsModule {}
