import { buildMessage, isNumber, isObject, isString, registerDecorator, ValidationOptions } from "class-validator";

/**
 * A custom validator for actual attribute values
 */
export function IsAttributesObject(validationOptions?: ValidationOptions) {
    return function (object: unknown, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: {
                validate: (attributes: any) => {
                    // Check if attributes is even an object
                    if (!isObject(attributes)) return false;

                    // Check the attributes
                    for (const [key, value] of Object.entries(attributes)) {
                        if (!isString(key)) return false;
                        if (!(isString(value) || isNumber(value))) return false;
                    }
                    return true;
                },
                defaultMessage: buildMessage(
                    (eachPrefix) =>
                        `${eachPrefix} $property has to be an object and the attributes have to either strings or numbers.`,
                    validationOptions,
                ),
            },
        });
    };
}
