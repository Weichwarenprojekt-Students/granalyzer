import { Module } from "@nestjs/common";
import { FoldersService } from "./folders.service";
import { FoldersController } from "./folders.controller";
import { UtilsNode } from "../util/utils.node";

@Module({
    providers: [FoldersService, UtilsNode],
    controllers: [FoldersController],
})
export class FoldersModule {}
