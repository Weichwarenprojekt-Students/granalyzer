import { RelationsService } from "./relations.service";
import { DataSchemeService } from "../data-scheme/data-scheme.service";
import { RelationsController } from "./relations.controller";
import { Module } from "@nestjs/common";
import { RelationsAttributesService } from "./relations-attributes.service";

@Module({
    providers: [RelationsService, RelationsAttributesService, DataSchemeService],
    controllers: [RelationsController],
})
export class RelationsModule {}
