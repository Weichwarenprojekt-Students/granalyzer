import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { FoldersService } from "./folders.service";

@Controller("folders")
export class FoldersController {
    constructor(private readonly foldersService: FoldersService) {}

    /**
     * Return all folders at top level (which are not nested into another folder)
     */
    @Get()
    getAllRootFolders() {
        return this.foldersService.getAllRootFolders();
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

    @Delete(":id")
    deleteFolder(@Param("id") id: number) {
        return this.foldersService.deleteFolder(id);
    }

    @Get(":id/children")
    getChildrenOfFolder(@Param("id") id: number) {
        return this.foldersService.getChildrenOfFolder(id);
    }

    @Get(":id/children/:childId")
    getChildOfFolder(@Param("id") id: number, @Param("childId") childId: number) {
        return this.foldersService.getChildOfFolder(id, childId);
    }

    @Post(":id/children/:childId")
    addChildToFolder(@Param("id") id: number, @Param("childId") childId: number) {
        return this.foldersService.addChildToFolder(id, childId);
    }

    @Delete(":id/children/:childId")
    removeChildFromFolder(@Param("id") id: number, @Param("childId") childId: number) {
        return this.foldersService.removeChildFromFolder(id, childId);
    }
}
