import { DynamicModule, Module } from "@nestjs/common";
import { DataSchemeUtil } from "./data-scheme.util";
import { DatabaseUtil } from "./database.util";
import { DataSchemeService } from "../data-scheme/data-scheme.service";
import TestUtil from "./test.util";

@Module({
    providers: [DataSchemeService],
})
export class UtilModule {
    static forRoot(): DynamicModule {
        return {
            module: UtilModule,
            global: true,
            providers: [DataSchemeUtil, DatabaseUtil, TestUtil],
            exports: [DataSchemeUtil, DatabaseUtil, TestUtil],
        };
    }
}
