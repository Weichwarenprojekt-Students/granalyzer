import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
    getHello(): string {
        const title = {
            title: "Hello granalyzer!",
        };
        return JSON.stringify(title);
    }
}
