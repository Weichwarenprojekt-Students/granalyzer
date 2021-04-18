import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

@Injectable()
export class ValidationPipe implements PipeTransform {
    /**
     * The general validation pipe. It will convert generic input
     * to an actual class instance and will check the validity
     *
     * @param value The input value
     * @param metadata The meta data (type information)
     */
    async transform(value: any, metadata: ArgumentMetadata) {
        if (!metadata.metatype) return value;
        const object = plainToClass(metadata.metatype, value);
        const errors = await validate(object, { whitelist: true, stopAtFirstError: true });
        if (errors.length > 0)
            throw new BadRequestException("Validation failed!", JSON.stringify(errors[0].constraints));
        return object;
    }
}
