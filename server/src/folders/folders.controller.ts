import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { FoldersService } from "./folders.service";

@Controller("folders")
export class FoldersController {
    constructor(private readonly foldersService: FoldersService) {}

    @Get()
    getAllFolders() {
        return this.foldersService.getFolders();
    }

    @Get(":id")
    getFolder(@Param("id") id: number) {
        return this.foldersService.getFolder(id);
    }

    @Put(":id")
    updateFolder(@Param("id") id: number, @Body("name") name: string) {
        return this.foldersService.updateFolder(id, name);
    }

    @Post()
    addFolder(@Body("name") name: string) {
        return this.foldersService.addFolder(name);
    }

    @Delete("id")
    deleteFolder(@Param("id") id: number) {
        return this.foldersService.deleteFolder(id);
    }
}
