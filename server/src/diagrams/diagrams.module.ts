import { Module } from "@nestjs/common";
import { DiagramsController } from "./diagrams.controller";
import { DiagramsService } from "./diagrams.service";

@Module({
    controllers: [DiagramsController],
    providers: [DiagramsService],
})
export class DiagramsModule {}
