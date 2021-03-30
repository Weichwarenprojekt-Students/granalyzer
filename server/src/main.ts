import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Setup swagger docs
    const config = new DocumentBuilder()
        .setTitle("Granalyzer API")
        .setDescription("Awesome access to the Graph")
        .setVersion("1.0")
        .addTag("diagrams")
        .addTag("folders")
        .addTag("data-scheme")
        .addTag("nodes")
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(process.env.SWAGGER_PREFIX, app, document);

    // Set route prefix which is used globally
    app.setGlobalPrefix(process.env.API_PREFIX);

    // Start server at defined port
    await app.listen(process.env.BACKEND_PORT);
}

bootstrap();
