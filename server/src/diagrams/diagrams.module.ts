import { Module } from "@nestjs/common";
import { DiagramsController } from "./diagrams.controller";
import { DiagramsService } from "./diagrams.service";
import { UtilsNode } from "../util/utils.node";
import { FoldersService } from "../folders/folders.service";

@Module({
    controllers: [DiagramsController],
    providers: [DiagramsService, UtilsNode, FoldersService],
})
export class DiagramsModule {}
