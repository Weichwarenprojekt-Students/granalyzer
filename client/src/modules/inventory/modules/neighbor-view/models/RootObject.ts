import { Connection } from "@/modules/inventory/modules/neighbor-view/models/Connection";
import { Attribute } from "@/modules/inventory/modules/neighbor-view/models/Attribute";

export interface RootObject {
    name: string;
    attributes: Array<Attribute>;
    connections: Array<Connection>;
}
