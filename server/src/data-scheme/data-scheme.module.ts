import { Module } from "@nestjs/common";
import { DataSchemeController } from "./data-scheme.controller";
import { DataSchemeService } from "./data-scheme.service";
import { UtilsNode } from "../util/utils.node";

@Module({
    controllers: [DataSchemeController],
    providers: [DataSchemeService, UtilsNode],
})
export class DataSchemeModule {}
