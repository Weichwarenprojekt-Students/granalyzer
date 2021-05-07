import {
    buildMessage,
    isArray,
    isBoolean,
    isHexColor,
    isNumber,
    isObject,
    isString,
    minLength,
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
                        if (!isString(attribute.name) || !minLength(attribute.name.trim(), 1)) return false;
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
                            case Datatype.ENUM:
                                // Check if config is string array
                                if (!isArray(attribute.config) || attribute.config.length <= 0) return false;
                                for (const value of attribute.config)
                                    if (!isString(value) || !minLength(value.trim(), 1)) return false;
                                // Check if default value is included in enum config
                                if (!attribute.config.includes(attribute.defaultValue)) return false;
                                // Check whether the values are unique
                                if (new Set(attribute.config).size !== attribute.config.length) return false;
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
