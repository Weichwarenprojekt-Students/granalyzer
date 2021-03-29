import { Controller, Get, Param } from "@nestjs/common";
import { DataSchemeService } from "./data-scheme.service";

@Controller("data-scheme")
export class DataSchemeController {
    constructor(private readonly dataSchemeService: DataSchemeService) {}

    @Get()
    getScheme() {
        return this.dataSchemeService.getScheme();
    }

    @Get("/label")
    getAllLabels() {
        return this.dataSchemeService.getAllLabel();
    }

    @Get("/label/:id")
    getLabel(@Param("id") id: number) {
        return this.dataSchemeService.getLabel(id);
    }

    @Get("relation")
    getAllRelations() {
        return this.dataSchemeService.getAllRelations();
    }

    @Get("/relation/:id")
    getRelation(@Param("id") id: number) {
        return this.dataSchemeService.getRelation(id);
    }
}
