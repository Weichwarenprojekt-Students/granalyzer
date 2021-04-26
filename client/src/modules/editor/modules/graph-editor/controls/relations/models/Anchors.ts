import { anchors } from "jointjs";

export default interface Anchors {
    /**
     * Source anchor of a link
     */
    sourceAnchor?: anchors.AnchorJSON;
    /**
     * Target anchor of a link
     */
    targetAnchor?: anchors.AnchorJSON;
}
