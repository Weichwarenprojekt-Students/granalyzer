import { Module } from "@nestjs/common";
import { FoldersService } from "./folders.service";
import { FoldersController } from "./folders.controller";
import { DiagramsService } from "../diagrams/diagrams.service";

@Module({
    providers: [FoldersService, DiagramsService],
    controllers: [FoldersController],
})
export class FoldersModule {}
