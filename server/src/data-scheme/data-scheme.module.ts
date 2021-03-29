import { Module } from "@nestjs/common";
import { DataSchemeController } from "./data-scheme.controller";
import { DataSchemeService } from "./data-scheme.service";

@Module({
    controllers: [DataSchemeController],
    providers: [DataSchemeService],
})
export class DataSchemeModule {}
