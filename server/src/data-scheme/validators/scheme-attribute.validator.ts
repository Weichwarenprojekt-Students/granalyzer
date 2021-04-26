import {
    buildMessage,
    isArray,
    isBoolean,
    isHexColor,
    isNumber,
    isObject,
    isString,
    registerDecorator,
    ValidationOptions,
} from "class-validator";
import { Attribute } from "../models/attributes.model";
import { Datatype } from "../models/data-type.model";

/**
 * A custom validator for attribute definitions in schemes
 */
export function IsAttributeDefinition(validationOptions?: ValidationOptions) {
    return function (object: unknown, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: {
                validate: (attributes: Attribute[]) => {
                    // Check if attributes is even an object
                    if (!isArray(attributes)) return false;

                    // Check the attributes
                    const names = new Set<string>();
                    for (const attribute of attributes) {
                        // Validate the object itself
                        if (!isObject(attribute)) return false;
                        if (!isString(attribute.name)) return false;
                        if (!isBoolean(attribute.mandatory)) return false;

                        // Check the datatype
                        switch (attribute.datatype) {
                            case Datatype.COLOR:
                                if (!isHexColor(attribute.defaultValue)) return false;
                                break;
                            case Datatype.NUMBER:
                                if (!isNumber(attribute.defaultValue)) return false;
                                break;
                            case Datatype.STRING:
                                if (!isString(attribute.defaultValue)) return false;
                                break;
                            default:
                                return false;
                        }

                        // Check if the name is unique
                        if (names.has(attribute.name) || attribute.name === "") return false;
                        names.add(attribute.name);
                    }
                    return true;
                },
                defaultMessage: buildMessage(
                    (eachPrefix) =>
                        `Every item in ${eachPrefix} $property requires a unique name, a mandatory flag, a datatype, and a default value matching the datatype.`,
                    validationOptions,
                ),
            },
        });
    };
}
