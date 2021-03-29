import { Module } from "@nestjs/common";
import { FoldersService } from "./folders.service";
import { FoldersController } from "./folders.controller";
import { UtilsNode } from "../util/utils.node";
import { DiagramsService } from "../diagrams/diagrams.service";

@Module({
    providers: [FoldersService, UtilsNode, DiagramsService],
    controllers: [FoldersController],
})
export class FoldersModule {}
