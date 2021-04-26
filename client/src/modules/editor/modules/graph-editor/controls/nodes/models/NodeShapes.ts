import { dia, shapes } from "jointjs";

export class NodeShapes {
    /**
     * The value for a rectangle
     */
    public static readonly RECTANGLE = "rectangle";
    /**
     * The value for a circle
     */
    public static readonly CIRCLE = "circle";

    /**
     * Return the right shape for a given type
     *
     * @param type The type of node as string
     */
    public static parseType(type: string): dia.Element {
        switch (type) {
            case this.CIRCLE:
                return new shapes.standard.Circle();
            default:
                return new shapes.standard.Rectangle();
        }
    }
}
