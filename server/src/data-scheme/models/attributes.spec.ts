/**
 * Attribute parsing tests
 *
 * @group unit/data-scheme/attributes
 */

import { Attribute, ColorAttribute, NumberAttribute, StringAttribute } from "./attributes";

describe("Attribute", () => {
    describe("fromJSON", () => {
        it("should return a correct attribute array", () => {
            const str = JSON.stringify([new StringAttribute(), new ColorAttribute(), new NumberAttribute()]);

            const parsed = Attribute.fromJson(str) as Attribute[];

            expect(Array.isArray(parsed)).toBeTruthy();

            parsed.forEach((p) => {
                expect(p instanceof Attribute).toBeTruthy();

                expect(p.datatype).toStrictEqual(getDataType(p));
            });
        });
    });
});

/**
 * Get the value of the datatype attribute for the corresponding subclass
 * @param att Attribute object
 */
function getDataType(att: Attribute): string {
    return att instanceof StringAttribute
        ? new StringAttribute().datatype
        : att instanceof NumberAttribute
        ? new NumberAttribute().datatype
        : att instanceof ColorAttribute
        ? new ColorAttribute().datatype
        : "???";
}
