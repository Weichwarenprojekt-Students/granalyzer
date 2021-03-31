import { DynamicModule, Module } from "@nestjs/common";
import { DataSchemeUtil } from "./data-scheme.util";
import { UtilsNode } from "./utils.node";
import { DataSchemeService } from "../data-scheme/data-scheme.service";

@Module({
    providers: [DataSchemeService],
})
export class UtilModule {
    static forRoot(): DynamicModule {
        return {
            module: UtilModule,
            global: true,
            providers: [DataSchemeUtil, UtilsNode],
            exports: [DataSchemeUtil, UtilsNode],
        };
    }
}
