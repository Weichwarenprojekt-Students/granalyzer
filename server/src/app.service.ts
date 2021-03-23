import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
    getHello(): string {
        const title = {
            title: process.env.DB_USERNAME,
        };
        return JSON.stringify(title);
    }
}
