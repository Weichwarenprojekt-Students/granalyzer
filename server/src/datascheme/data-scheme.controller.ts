import { Controller, Get, Param, Post, Body, Put, Delete } from "@nestjs/common";
import { DataSchemeService } from "./data-scheme.service";

@Controller("data-scheme")
export class DataSchemeController {
    constructor(private readonly dataSchemeService: DataSchemeService) {}

    @Get()
    getScheme() {
        return "Correct Tested";
        //return this.dataSchemeService.getDataScheme();
    }
}
