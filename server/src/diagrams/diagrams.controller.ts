import { Controller, Get, Param, Post, Body, Put } from "@nestjs/common";
import { DiagramsService } from "./diagrams.service";

@Controller("diagrams")
export class DiagramsController {
    constructor(private readonly diagramsService: DiagramsService) {}

    @Get()
    getAllDiagrams() {
        return this.diagramsService.getDiagrams();
    }

    @Get(":id")
    getDiagram(@Param("id") id: number) {
        return this.diagramsService.getDiagram(id);
    }

    @Post()
    async addDiagram(@Body("name") name: string) {
        return this.diagramsService.addDiagram(name);
    }

    @Put(":id")
    async updateDiagram(@Param("id") id: number, @Body("name") name: string) {
        return this.diagramsService.updateDiagram(id, name);
    }
}
