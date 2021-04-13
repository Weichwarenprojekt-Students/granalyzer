import { RelationsService } from "./relations.service";
import { DataSchemeService } from "../data-scheme/data-scheme.service";
import { RelationsController } from "./relations.controller";
import { Module } from "@nestjs/common";

@Module({
    providers: [RelationsService, DataSchemeService],
    controllers: [RelationsController],
})
export class RelationsModule {}
