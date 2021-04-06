import { Module } from "@nestjs/common";
import { DiagramsController } from "./diagrams.controller";
import { DiagramsService } from "./diagrams.service";
import { FoldersService } from "../folders/folders.service";

@Module({
    controllers: [DiagramsController],
    providers: [DiagramsService, FoldersService],
})
export class DiagramsModule {}
