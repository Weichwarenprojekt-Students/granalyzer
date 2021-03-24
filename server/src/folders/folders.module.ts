import { Module } from "@nestjs/common";
import { FoldersService } from "./folders.service";
import { FoldersController } from "./folders.controller";

@Module({
    providers: [FoldersService],
    controllers: [FoldersController],
})
export class FoldersModule {}
