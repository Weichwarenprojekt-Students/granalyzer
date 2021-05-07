import { buildMessage, isString, minLength, registerDecorator, ValidationOptions } from "class-validator";

/**
 * A custom validator for names to prevent empty strings
 */
export function IsValidName(validationOptions?: ValidationOptions) {
    return function (object: unknown, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: {
                validate: (name: any) => {
                    if (!isString(name)) return false;
                    return minLength(name.trim(), 1);
                },
                defaultMessage: buildMessage(
                    (eachPrefix) =>
                        `${eachPrefix} $property has to be a valid name (min. 1 character, no empty strings)`,
                    validationOptions,
                ),
            },
        });
    };
}
